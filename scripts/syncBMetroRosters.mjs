import fs from 'fs';
import path from 'path';

async function main() {
    console.log('Fetching B Metropolitana teams and rosters from ESPN...');
    const API_URL = 'https://site.api.espn.com/apis/site/v2/sports/soccer/arg.3/teams?limit=100';

    let data;
    try {
        const res = await fetch(API_URL);
        data = await res.json();
    } catch (e) {
        console.error('Fetch error:', e);
        return;
    }

    const rawTeams = data.sports[0].leagues[0].teams.map(t => t.team);
    console.log(`Found ${rawTeams.length} teams.`);

    console.log('Fetching match history (Scoreboard) to build rosters and stats...');
    let allEvents = [];
    const urls2026 = [
        'https://site.api.espn.com/apis/site/v2/sports/soccer/arg.3/scoreboard?dates=20260101-20261231&limit=1000'
    ];
    for (const url of urls2026) {
        try {
            const res = await fetch(url);
            const d = await res.json();
            if (d.events) allEvents = [...allEvents, ...d.events];
        } catch (e) {
            console.error('Error fetching scoreboard:', e);
        }
    }

    console.log(`Found ${allEvents.length} events. Building rosters...`);

    // Pass 1: Collect unique players from match details
    const playersByTeam = {}; // { teamId: { playerId: playerObj } }

    allEvents.forEach(ev => {
        const comp = ev.competitions[0];
        if (!comp || !comp.details) return;

        comp.details.forEach(detail => {
            const teamId = detail.team?.id;
            if (!teamId) return;
            if (!playersByTeam[teamId]) playersByTeam[teamId] = {};

            const athletes = detail.athletesInvolved || [];
            athletes.forEach(ath => {
                if (!playersByTeam[teamId][ath.id]) {
                    playersByTeam[teamId][ath.id] = {
                        id: ath.id,
                        name: (ath.displayName || 'Desconocido').replace(/'/g, "\\'"),
                        position: 'MID', 
                        age: 25,
                        goals: 0,
                        yellowCards: 0,
                        redCards: 0
                    };
                }
                
                const p = playersByTeam[teamId][ath.id];
                if (detail.scoringPlay) p.goals++;
                if (detail.yellowCard) p.yellowCards++;
                if (detail.redCard) p.redCards++;
            });
        });
    });

    const INITIAL_STATS = `{ played: 0, won: 0, drawn: 0, lost: 0, gf: 0, gc: 0, pts: 0, goalDiff: 0 }`;
    const INITIAL_STREAKS = `{ win: 0, unbeaten: 0, loss: 0 }`;

    let teamsCodeStr = '';
    for (const team of rawTeams) {
        const teamPlayersMap = playersByTeam[team.id] || {};
        const teamPlayers = Object.values(teamPlayersMap);
        
        console.log(`Team ${team.displayName}: ${teamPlayers.length} players found.`);

        const playersStrs = teamPlayers.map(p => `{
            id: '${p.id}',
            name: '${p.name}',
            position: '${p.position}' as 'GK' | 'DEF' | 'MID' | 'FWD',
            age: ${p.age},
            goals: ${p.goals},
            assists: 0,
            yellowCards: ${p.yellowCards},
            redCards: ${p.redCards},
            matchesPlayed: 0
        }`);

        teamsCodeStr += `
    {
        id: '${team.slug}',
        apiId: ${team.id},
        name: '${team.displayName.replace(/'/g, "\\'")}',
        shortName: '${team.abbreviation || team.displayName.substring(0, 3).toUpperCase()}',
        logo: '${team.logos?.[0]?.href || ''}',
        zone: 'A',
        coach: 'Desconocido',
        stadium: 'Estadio Local',
        stadiumCapacity: 20000,
        membersCount: 15000,
        formation: '4-4-2',
        stats: ${INITIAL_STATS},
        streaks: ${INITIAL_STREAKS},
        form: [],
        homeStats: ${INITIAL_STATS},
        awayStats: ${INITIAL_STATS},
        positionHistory: [],
        averages: { pts2024: 0, pj2024: 0, pts2025: 0, pj2025: 0 },
        players: [${playersStrs.join(',')}]
    },`;
    }

    const fileContent = `import type { Team } from '@/lib/types';\n\nexport const TEAMS: Team[] = [\n${teamsCodeStr}\n];\n`;
    fs.writeFileSync(path.resolve(process.cwd(), 'src/lib/data/b-metro/teams.ts'), fileContent);
    console.log('Saved fully populated teams to src/lib/data/b-metro/teams.ts');
}

main();
