import fs from 'fs';
import path from 'path';

const PROMIEDOS_DATA = {
    'excursionistas': [
        { name: 'Nicolás Rodríguez', pos: 'GK' }, { name: 'Matías Escobar', pos: 'GK' },
        { name: 'Mariano Arango', pos: 'DEF' }, { name: 'Ignacio Maizarez', pos: 'DEF' }, { name: 'Lucas Mulazzi', pos: 'DEF' }, { name: 'Matías Blengio', pos: 'DEF' },
        { name: 'Ivan Arbello', pos: 'DEF' }, { name: 'Gonzalo Pedrosa', pos: 'DEF' }, { name: 'Gerónimo Rodriguez', pos: 'DEF' }, { name: 'Horacio Igarzábal', pos: 'DEF' },
        { name: 'Antonio Paulides', pos: 'MID' }, { name: 'Alan Espeche', pos: 'MID' }, { name: 'Matías Fernández', pos: 'MID' }, { name: 'Miguel López', pos: 'MID' },
        { name: 'Mateo Cardozo', pos: 'MID' }, { name: 'Gian Zoratti', pos: 'MID' },
        { name: 'Federico Haberkorn', pos: 'FWD' }, { name: 'Gabriel Tellas', pos: 'FWD' }, { name: 'Máximo Blanco', pos: 'FWD' }, { name: 'Francesco Celeste', pos: 'FWD' }
    ],
    'argentino_quilmes': [
        { name: 'Ramiro García', pos: 'GK' }, { name: 'Nahuel Yzaurralde', pos: 'GK' }, { name: 'Germán Cheppi', pos: 'GK' },
        { name: 'Demian Núñez', pos: 'DEF' }, { name: 'Nicolás Benavídez', pos: 'DEF' }, { name: 'Fernando Cosciuc', pos: 'DEF' }, { name: 'Facundo Lando', pos: 'DEF' }, { name: 'Lucio Nadalin', pos: 'DEF' },
        { name: 'Marcelo Vega', pos: 'MID' }, { name: 'Leandro Guzmán', pos: 'MID' }, { name: 'Tomás Bugallo', pos: 'MID' }, { name: 'Juan Ignacio Quattrocchi', pos: 'MID' },
        { name: 'Franco Sosa', pos: 'FWD' }, { name: 'Joel Martínez', pos: 'FWD' }, { name: 'Dylan Oyarzún', pos: 'FWD' }, { name: 'Fabricio Filliol', pos: 'FWD' }
    ],
    'deportivo_laferrere': [
        { name: 'Federico Haberkorn', pos: 'FWD' }, { name: 'Gabriel Tellas', pos: 'FWD' } 
    ],
    'villa_dlmine': [
        { name: 'Juan Martín Rojas', pos: 'GK' }, { name: 'Luciano Báez', pos: 'GK' },
        { name: 'Ezequiel Ramón', pos: 'DEF' }, { name: 'Diego Vitale', pos: 'DEF' }, { name: 'Gastón Bojanich', pos: 'DEF' }, { name: 'Cristian Broggi', pos: 'DEF' },
        { name: 'Matías Nizzo', pos: 'MID' }, { name: 'Pablo Oro', pos: 'MID' }, { name: 'Tomás Ponzo', pos: 'MID' }, { name: 'Santiago Prim', pos: 'MID' },
        { name: 'Guillermo Resquín', pos: 'FWD' }, { name: 'Edwin Schulz', pos: 'FWD' }, { name: 'Lucas Muñoz', pos: 'FWD' }
    ]
};

async function main() {
    console.log('Fetching B Metropolitana teams from ESPN...');
    const API_URL = 'https://site.api.espn.com/apis/site/v2/sports/soccer/arg.3/teams?limit=100';

    const res = await fetch(API_URL);
    const data = await res.json();
    const rawTeams = data.sports[0].leagues[0].teams.map(t => t.team);

    const allTeamsData = [];

    for (const team of rawTeams) {
        console.log(`Processing ${team.displayName} (${team.id})...`);
        let players = [];

        // Try Roster API with fallback to arg.2
        for (const league of ['arg.3', 'arg.2']) {
            try {
                const rRes = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/teams/${team.id}/roster`);
                const rData = await rRes.json();
                if (rData.athletes && rData.athletes.length > 0) {
                    players = rData.athletes.map(ath => {
                        let pos = 'MID';
                        const posStr = ath.position?.abbreviation || '';
                        if (posStr === 'G') pos = 'GK';
                        else if (posStr === 'D') pos = 'DEF';
                        else if (posStr === 'M') pos = 'MID';
                        else if (posStr === 'F' || posStr === 'S') pos = 'FWD';

                        return {
                            id: ath.id,
                            name: (ath.displayName || 'Desconocido').replace(/'/g, "\\'"),
                            position: pos,
                            age: ath.age || 25,
                            goals: 0,
                            yellowCards: 0,
                            redCards: 0,
                            assists: 0,
                            matchesPlayed: 0
                        };
                    });
                    console.log(`  Found ${players.length} players in ${league}`);
                    break;
                }
            } catch (e) {}
        }

        // If still empty, check Promiedos hardcoded data
        if (players.length === 0 && PROMIEDOS_DATA[team.slug]) {
            players = PROMIEDOS_DATA[team.slug].map((p, pIdx) => ({
                id: `p-${team.id}-${pIdx}`,
                name: p.name.replace(/'/g, "\\'"),
                position: p.pos,
                age: 25,
                goals: 0,
                yellowCards: 0,
                redCards: 0,
                assists: 0,
                matchesPlayed: 0
            }));
            console.log(`  Found ${players.length} players in Promiedos data`);
        }

        // Final fallback: Basic squad if nothing found
        if (players.length === 0) {
            console.log(`  No roster found. Generating base squad...`);
            players = [
                { id: `gk-${team.id}`, name: 'Arquero Titular', position: 'GK', age: 28, goals: 0, yellowCards: 0, redCards: 0, assists: 0, matchesPlayed: 0 },
                { id: `def-${team.id}`, name: 'Defensor Central', position: 'DEF', age: 26, goals: 0, yellowCards: 0, redCards: 0, assists: 0, matchesPlayed: 0 },
                { id: `mid-${team.id}`, name: 'Mediocampista', position: 'MID', age: 24, goals: 0, yellowCards: 0, redCards: 0, assists: 0, matchesPlayed: 0 },
                { id: `fwd-${team.id}`, name: 'Delantero', position: 'FWD', age: 23, goals: 0, yellowCards: 0, redCards: 0, assists: 0, matchesPlayed: 0 }
            ];
        }

        allTeamsData.push({ ...team, players });
    }

    // Pass 2: Scrape scores from scoreboard to inject into players
    console.log('Injecting goals and cards from 2026 matches...');
    const boardRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/arg.3/scoreboard?dates=20260101-20261231&limit=1000');
    const boardData = await boardRes.json();
    const events = boardData.events || [];

    for (const ev of events) {
        const comp = ev.competitions[0];
        if (!comp || !comp.details) continue;
        for (const detail of comp.details) {
            const athletes = detail.athletesInvolved || [];
            for (const ath of athletes) {
                for (const t of allTeamsData) {
                    const p = t.players.find(p => p.id === ath.id || p.name === ath.displayName);
                    if (p) {
                        if (detail.scoringPlay) p.goals++;
                        if (detail.yellowCard) p.yellowCards++;
                        if (detail.redCard) p.redCards++;
                    }
                }
            }
        }
    }

    let teamsCodeStr = '';
    const INITIAL_STATS = `{ played: 0, won: 0, drawn: 0, lost: 0, gf: 0, gc: 0, pts: 0, goalDiff: 0 }`;
    const INITIAL_STREAKS = `{ win: 0, unbeaten: 0, loss: 0 }`;

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
        id: '${t.slug}',
        apiId: ${t.id},
        name: '${t.displayName.replace(/'/g, "\\'")}',
        shortName: '${t.abbreviation || t.displayName.substring(0, 3).toUpperCase()}',
        logo: '${t.logos?.[0]?.href || ''}',
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
