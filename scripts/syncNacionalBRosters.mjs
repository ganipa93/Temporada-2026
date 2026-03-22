import fs from 'fs';
import path from 'path';

async function main() {
    console.log('Fetching B Nacional teams and rosters from ESPN...');
    const API_URL = 'https://site.api.espn.com/apis/site/v2/sports/soccer/arg.2/teams?limit=100';

    let data;
    try {
        const res = await fetch(API_URL);
        data = await res.json();
    } catch (e) {
        console.error('Fetch error:', e);
        return;
    }

    const rawTeams = data.sports[0].leagues[0].teams.map(t => t.team);
    console.log(`Found ${rawTeams.length} teams. Commencing roster downloads...`);

    const INITIAL_STATS = `{ played: 0, won: 0, drawn: 0, lost: 0, gf: 0, gc: 0, pts: 0, goalDiff: 0 }`;
    const INITIAL_STREAKS = `{ win: 0, unbeaten: 0, loss: 0 }`;

    const allTeamsData = [];

    for (let idx = 0; idx < rawTeams.length; idx++) {
        const team = rawTeams[idx];
        console.log(`Fetching roster for ${team.displayName}... (${idx + 1}/${rawTeams.length})`);
        
        let playersData = [];
        try {
            const rRes = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/arg.2/teams/${team.id}/roster`);
            const rData = await rRes.json();
            if (rData.athletes) {
                playersData = rData.athletes.map(ath => {
                    let pos = 'MID';
                    const posStr = ath.position?.abbreviation || '';
                    if (posStr === 'G') pos = 'GK';
                    else if (posStr === 'D') pos = 'DEF';
                    else if (posStr === 'M') pos = 'MID';
                    else if (posStr === 'F' || posStr === 'S') pos = 'FWD';

                    return {
                        id: ath.id || Math.random().toString(36).substr(2, 9),
                        name: (ath.displayName || 'Desconocido').replace(/'/g, "\\'"),
                        position: pos,
                        age: ath.age || 25,
                        goals: 0,
                        yellowCards: 0,
                        redCards: 0
                    };
                });
            }
        } catch(e) { console.error('  Failed roster for', team.displayName); }


        allTeamsData.push({
            id: team.slug,
            apiId: team.id,
            name: team.displayName.replace(/'/g, "\\'"),
            shortName: team.abbreviation || team.displayName.substring(0, 3).toUpperCase(),
            logo: team.logos?.[0]?.href || '',
            zone: idx % 2 === 0 ? 'A' : 'B',
            players: playersData
        });
    }

    console.log('Fetching match history to recalculate stats...');
    let allEvents = [];
    const urls2025 = [
        'https://site.api.espn.com/apis/site/v2/sports/soccer/arg.2/scoreboard?dates=20250101-20250630&limit=500',
        'https://site.api.espn.com/apis/site/v2/sports/soccer/arg.2/scoreboard?dates=20250701-20251231&limit=500'
    ];
    for (const url of urls2025) {
        try {
            const res = await fetch(url);
            const data = await res.json();
            if (data.events) allEvents = [...allEvents, ...data.events];
        } catch (e) {}
    }

    console.log(`Processing ${allEvents.length} matches for player statistics...`);

    for (const ev of allEvents) {
        const comp = ev.competitions[0];
        if (!comp || !comp.details) continue;

        for (const detail of comp.details) {
            const isGoal = detail.scoringPlay;
            const isYellow = detail.yellowCard;
            const isRed = detail.redCard;
            
            if (!isGoal && !isYellow && !isRed) continue;

            const athletes = detail.athletesInvolved || [];
            for (const ath of athletes) {
                // Find athlete in memory
                for (const t of allTeamsData) {
                    const player = t.players.find(p => p.id === ath.id);
                    if (player) {
                        if (isGoal) player.goals += 1;
                        if (isYellow) player.yellowCards += 1;
                        if (isRed) player.redCards += 1;
                    }
                }
            }
        }
    }

    let teamsCodeStr = '';
    for (const t of allTeamsData) {
        const playersStrs = t.players.map(p => `{
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
        id: '${t.id}',
        apiId: ${t.apiId},
        name: '${t.name}',
        shortName: '${t.shortName}',
        logo: '${t.logo}',
        zone: '${t.zone}',
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
    fs.writeFileSync(path.resolve(process.cwd(), 'src/lib/data/nacional-b/teams.ts'), fileContent);
    console.log('Saved fully populated teams to nacional-b/teams.ts');
}

main();
