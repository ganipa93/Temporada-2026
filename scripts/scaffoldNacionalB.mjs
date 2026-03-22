import fs from 'fs';
import path from 'path';

async function main() {
    console.log('Scaffolding B Nacional data from ESPN AR.2...');
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
    console.log(`Found ${rawTeams.length} teams.`);

    const INITIAL_STATS = `{ played: 0, won: 0, drawn: 0, lost: 0, gf: 0, gc: 0, pts: 0, goalDiff: 0 }`;
    const INITIAL_STREAKS = `{ win: 0, unbeaten: 0, loss: 0 }`;

    const teamsCodeStr = rawTeams.map((team, idx) => {
        const id = team.slug;
        const apiId = team.id;
        const name = team.displayName;
        const shortName = team.abbreviation || name.substring(0, 3).toUpperCase();
        const logo = team.logos?.[0]?.href || '';
        // ESPN doesn't output zones clearly in this endpoint, split evenly
        const zone = idx % 2 === 0 ? 'A' : 'B';
        return `
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
        players: []
    }`;
    }).join(',');

    const fileContent = `import type { Team } from '@/lib/types';\n\nexport const TEAMS: Team[] = [${teamsCodeStr}\n];\n`;
    
    fs.writeFileSync(path.resolve(process.cwd(), 'src/lib/data/nacional-b/teams.ts'), fileContent);
    console.log('Generated nacional-b/teams.ts');

    // Scaffold empty 36-round fixture
    const fixtures = [];
    let matchId = 1;
    for (let round = 1; round <= 36; round++) {
        // Just pair them up sequentially for the scaffold
        // 36 teams = 18 matches per round
        for (let i = 0; i < 18; i++) {
            const h = rawTeams[i];
            const a = rawTeams[rawTeams.length - 1 - i];
            fixtures.push({
                id: `nb-${matchId++}`,
                date: `2026-${String(Math.floor((round-1)/4)+2).padStart(2,'0')}-${String((round%4)*7 + 1).padStart(2,'0')}T15:00:00Z`,
                status: 'NS',
                round: round,
                tournament: round <= 18 ? 'apertura' : 'clausura', // To reuse the Apertura/Clausura UI mechanics seamlessly
                homeTeamId: h.slug,
                awayTeamId: a.slug,
                homeScore: null,
                awayScore: null,
                events: [],
                isPlayed: false
            });
        }
    }

    fs.writeFileSync(path.resolve(process.cwd(), 'src/lib/data/nacional-b/official_fixture.json'), JSON.stringify(fixtures, null, 2));
    console.log('Generated nacional-b/official_fixture.json');
}

main();
