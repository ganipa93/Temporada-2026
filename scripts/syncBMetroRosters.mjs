import fs from 'fs';
import path from 'path';

const PROMIEDOS_DATA = {
    'arg.excursionistas': [
        { name: 'Nicolás Rodríguez', pos: 'GK' }, { name: 'Matías Escobar', pos: 'GK' },
        { name: 'Mariano Arango', pos: 'DEF' }, { name: 'Ignacio Maizarez', pos: 'DEF' }, { name: 'Lucas Mulazzi', pos: 'DEF' }, { name: 'Matías Blengio', pos: 'DEF' },
        { name: 'Ivan Arbello', pos: 'DEF' }, { name: 'Gonzalo Pedrosa', pos: 'DEF' }, { name: 'Gerónimo Rodriguez', pos: 'DEF' }, { name: 'Horacio Igarzábal', pos: 'DEF' },
        { name: 'Antonio Paulides', pos: 'MID' }, { name: 'Alan Espeche', pos: 'MID' }, { name: 'Matías Fernández', pos: 'MID' }, { name: 'Miguel López', pos: 'MID' },
        { name: 'Mateo Cardozo', pos: 'MID' }, { name: 'Gian Zoratti', pos: 'MID' },
        { name: 'Federico Haberkorn', pos: 'FWD' }, { name: 'Gabriel Tellas', pos: 'FWD' }, { name: 'Máximo Blanco', pos: 'FWD', goals: 4 },
        { name: 'Adrián Lugones', pos: 'FWD', goals: 2 }, { name: 'Brian Martin', pos: 'FWD', goals: 2 }, { name: 'Máximo Guzmán', pos: 'FWD', goals: 2 }, { name: 'Francesco Celeste', pos: 'FWD' }
    ],
    'argentino_quilmes': [
        { name: 'Ramiro García', pos: 'GK' }, { name: 'Nahuel Yzaurralde', pos: 'GK' }, { name: 'Germán Cheppi', pos: 'GK' },
        { name: 'Demian Núñez', pos: 'DEF' }, { name: 'Nicolás Benavídez', pos: 'DEF' }, { name: 'Fernando Cosciuc', pos: 'DEF' }, { name: 'Facundo Lando', pos: 'DEF' }, { name: 'Lucio Nadalin', pos: 'DEF' },
        { name: 'Marcelo Vega', pos: 'MID' }, { name: 'Leandro Guzmán', pos: 'MID' }, { name: 'Tomás Bugallo', pos: 'MID' }, { name: 'Juan Ignacio Quattrocchi', pos: 'MID' },
        { name: 'Joel Martínez', pos: 'FWD', goals: 2 }, { name: 'Franco Sosa', pos: 'FWD' }, { name: 'Dylan Oyarzún', pos: 'FWD' }, { name: 'Fabricio Filliol', pos: 'FWD' }
    ],
    'deportivo_laferrere': [
        { name: 'Federico Haberkorn', pos: 'FWD' }, { name: 'Gabriel Tellas', pos: 'FWD' } 
    ],
    'arg.flandria': [
        { name: 'Maximiliano Gagliardo', pos: 'GK' }, { name: 'Andrés Camacho', pos: 'DEF' },
        { name: 'Daniel González', pos: 'MID' }, { name: 'Agustín Prokop', pos: 'MID' },
        { name: 'Jonathan Palacio', pos: 'FWD' }, { name: 'Nazareno Diósquez', pos: 'FWD', goals: 3 }
    ],
    'arg.arsenal_de_sarandi': [
        { name: 'Nahuel Pezzini', pos: 'GK' }, { name: 'Julián Lobelos', pos: 'GK' },
        { name: 'Damián Pérez', pos: 'DEF' }, { name: 'Rodrigo Delvalle', pos: 'DEF' }, { name: 'Luca Franco', pos: 'DEF', goals: 2 }, { name: 'Thiago Schiavulli', pos: 'DEF' },
        { name: 'Alexis Vega', pos: 'MID' }, { name: 'Joaquín Ochoa', pos: 'MID' }, { name: 'Rodrigo Salinas', pos: 'MID', goals: 2 },
        { name: 'Martín Giménez', pos: 'FWD', goals: 3 }, { name: 'Uriel La Roza', pos: 'FWD' }, { name: 'Matías Sosa', pos: 'FWD' }
    ],
    'real_pilar': [
        { name: 'Franco Romero', pos: 'FWD', goals: 2 }, { name: 'Ricardo Ramirez', pos: 'FWD', goals: 2 }
    ],
    'san_martn_burzaco': [
        { name: 'Matias Samaniego', pos: 'FWD', goals: 2 }, { name: 'Nicolás Gauna', pos: 'FWD', goals: 2 }, { name: 'Franco Benítez', pos: 'FWD', goals: 2 }
    ],
    'club_sportivo_italiano': [
        { name: 'Luca Franco', pos: 'DEF', goals: 2 }
    ],
    'arg.talleres_de_remedios_de_escalada': [
        { name: 'Mauro Casoli', pos: 'GK' }, { name: 'Agustín Galván', pos: 'GK' },
        { name: 'Abel Luis Masuero', pos: 'DEF' }, { name: 'Fernando Enrique', pos: 'MID' },
        { name: 'Ignacio Colombini', pos: 'FWD' }, { name: 'Juan Pablo Arango', pos: 'FWD' }
    ],
    'arg.villa_dlmine': [
        { name: 'Juan Martín Rojas', pos: 'GK' }, { name: 'Luciano Báez', pos: 'GK' },
        { name: 'Ezequiel Ramón', pos: 'DEF' }, { name: 'Diego Vitale', pos: 'DEF' }, { name: 'Gastón Bojanich', pos: 'DEF' }, { name: 'Cristian Broggi', pos: 'DEF' },
        { name: 'Matías Nizzo', pos: 'MID' }, { name: 'Pablo Oro', pos: 'MID' }, { name: 'Tomás Ponzo', pos: 'MID', goals: 3 }, { name: 'Santiago Prim', pos: 'MID' },
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
        console.log(`Processing ${team.displayName} (slug: ${team.slug})...`);
        let players = [];

        // FALLBACK 1: Try Roster API with fallback to arg.2
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

        // FALLBACK 2: Check Promiedos hardcoded data
        if (players.length === 0 && PROMIEDOS_DATA[team.slug]) {
            players = PROMIEDOS_DATA[team.slug].map((p, pIdx) => ({
                id: `p-${team.id}-${pIdx}`,
                name: p.name.replace(/'/g, "\\'"),
                position: p.pos,
                age: 25,
                goals: p.goals || 0,
                yellowCards: 0,
                redCards: 0,
                assists: 0,
                matchesPlayed: 0
            }));
            console.log(`  Found ${players.length} players in hardcoded Promiedos data`);
        }

        // If it found players via arg.2, maybe we still want to inject the Promiedos goals if the name matches
        if (players.length > 0 && PROMIEDOS_DATA[team.slug]) {
             PROMIEDOS_DATA[team.slug].forEach(pData => {
                 if (pData.goals) {
                     const p = players.find(x => x.name === pData.name);
                     if (p) {
                         p.goals = pData.goals;
                         console.log(`  Injected ${pData.goals} goals to ${pData.name}`);
                     }
                 }
             });
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
