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

    let teamsCodeStr = '';

    for (let idx = 0; idx < rawTeams.length; idx++) {
        const team = rawTeams[idx];
        console.log(`Fetching roster for ${team.displayName}... (${idx + 1}/${rawTeams.length})`);
        
        let players = [];
        try {
            const rRes = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/arg.2/teams/${team.id}/roster`);
            const rData = await rRes.json();
            if (rData.athletes) {
                players = rData.athletes.map(ath => {
                    let pos = 'MID';
                    const posStr = ath.position?.abbreviation || '';
                    if (posStr === 'G') pos = 'GK';
                    else if (posStr === 'D') pos = 'DEF';
                    else if (posStr === 'M') pos = 'MID';
                    else if (posStr === 'F' || posStr === 'S') pos = 'FWD';

                    return `{
            id: '${ath.id || Math.random().toString(36).substr(2, 9)}',
            name: '${(ath.displayName || 'Desconocido').replace(/'/g, "\\'")}',
            position: '${pos}' as 'GK' | 'DEF' | 'MID' | 'FWD',
            age: ${ath.age || 25},
            goals: 0,
            assists: 0,
            yellowCards: 0,
            redCards: 0,
            matchesPlayed: 0
        }`;
                });
            }
        } catch(e) { console.error('  Failed roster for', team.displayName); }

        const id = team.slug;
        const apiId = team.id;
        const name = team.displayName.replace(/'/g, "\\'");
        const shortName = team.abbreviation || name.substring(0, 3).toUpperCase();
        const logo = team.logos?.[0]?.href || '';
        const zone = idx % 2 === 0 ? 'A' : 'B';
        
        teamsCodeStr += `
    {
        id: '${id}',
        apiId: ${apiId},
        name: '${name}',
        shortName: '${shortName}',
        logo: '${logo}',
        zone: '${zone}',
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
        players: [${players.join(',')}]
    },`;
    }

    const fileContent = `import type { Team } from '@/lib/types';\n\nexport const TEAMS: Team[] = [\n${teamsCodeStr}\n];\n`;
    fs.writeFileSync(path.resolve(process.cwd(), 'src/lib/data/nacional-b/teams.ts'), fileContent);
    console.log('Saved populated teams to nacional-b/teams.ts');
}

main();
