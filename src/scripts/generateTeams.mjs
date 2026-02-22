import fs from 'fs';
import path from 'path';

const ROSTERS_DIR = 'rosters';
const OUTPUT_FILE = 'src/data/teams.ts';

const METADATA = {
    "boca": { coach: "Fernando Gago", stadium: "La Bombonera", capacity: 54000, members: 350000, formation: "4-3-3" },
    "river": { coach: "Marcelo Gallardo", stadium: "Mâs Monumental", capacity: 84567, members: 350000, formation: "4-3-1-2" },
    "racing": { coach: "Gustavo Costas", stadium: "El Cilindro", capacity: 51389, members: 90000, formation: "4-3-3" },
    "independiente": { coach: "Julio Vaccari", stadium: "Libertadores de América", capacity: 52364, members: 100000, formation: "4-2-3-1" },
    "san-lorenzo": { coach: "Miguel Ángel Russo", stadium: "Nuevo Gasómetro", capacity: 47964, members: 80000, formation: "4-4-2" },
    "velez": { coach: "Gustavo Quinteros", stadium: "José Amalfitani", capacity: 49540, members: 60000, formation: "4-2-3-1" },
    "talleres": { coach: "Alexander Medina", stadium: "Mario Alberto Kempes", capacity: 57000, members: 70000, formation: "4-3-3" },
    "huracan": { coach: "Frank Kudelka", stadium: "Palacio Ducó", capacity: 48314, members: 50000, formation: "4-4-2" },
    "rosario": { coach: "Ariel Holan", stadium: "Gigante de Arroyito", capacity: 48900, members: 72000, formation: "4-2-3-1" },
    "estudiantes": { coach: "Eduardo Domínguez", stadium: "Jorge Luis Hirschi", capacity: 32530, members: 55000, formation: "4-4-2" },
    "gimnasia-lp": { coach: "Marcelo Méndez", stadium: "Juan Carmelo Zerillo", capacity: 30000, members: 40000, formation: "4-3-3" },
    "lanus": { coach: "Ricardo Zielinski", stadium: "Ciudad de Lanús", capacity: 47027, members: 28000, formation: "4-4-2" },
    "banfield": { coach: "Gustavo Munúa", stadium: "Florencio Sola", capacity: 34901, members: 30000, formation: "4-4-2" },
    "newells": { coach: "Sebastián Méndez", stadium: "Coloso del Parque", capacity: 42000, members: 70000, formation: "4-3-3" },
    "union": { coach: "Kily González", stadium: "15 de Abril", capacity: 28000, members: 25000, formation: "5-3-2" },
    "argentinos": { coach: "Pablo Guede", stadium: "Diego Armando Maradona", capacity: 24000, members: 20000, formation: "4-3-3" },
    "tigre": { coach: "Sebastián Domínguez", stadium: "José Dellagiovanna", capacity: 26282, members: 20000, formation: "4-4-2" },
    "platense": { coach: "Favio Orsi", stadium: "Ciudad de Vicente López", capacity: 34530, members: 15000, formation: "4-4-2" },
    "belgrano": { coach: "Juan Cruz Real", stadium: "Julio César Villagra", capacity: 34830, members: 60000, formation: "4-3-3" },
    "instituto": { coach: "Diego Dabove", stadium: "Juan Domingo Perón", capacity: 24500, members: 40000, formation: "4-3-3" },
    "defensa": { coach: "Pablo de Muner", stadium: "Norberto Tomaghello", capacity: 18000, members: 10000, formation: "4-3-3" },
    "atletico": { coach: "Facundo Sava", stadium: "José Fierro", capacity: 35200, members: 30000, formation: "4-4-2" },
    "central-cba": { coach: "Omar De Felippe", stadium: "Madre de Ciudades", capacity: 30000, members: 15000, formation: "4-4-2" },
    "barracas": { coach: "Rubén Darío Insúa", stadium: "Claudio Tapia", capacity: 4400, members: 5000, formation: "5-4-1" },
    "riestra": { coach: "Cristian Fabbiani", stadium: "Guillermo Laza", capacity: 3000, members: 2000, formation: "4-4-2" },
    "sarmiento": { coach: "Javier Sanguinetti", stadium: "Eva Perón", capacity: 22000, members: 12000, formation: "4-4-2" },
    "aldosivi": { coach: "Andrés Yllana", stadium: "José María Minella", capacity: 35180, members: 15000, formation: "4-4-2" },
    "ind-rivadavia": { coach: "Alfredo Berti", stadium: "Bautista Gargantini", capacity: 24000, members: 15000, formation: "4-4-2" },
    "gimnasia-m": { coach: "Ezequiel Medrán", stadium: "Víctor Legrotaglie", capacity: 14000, members: 10000, formation: "4-3-3" },
    "estudiantes-rc": { coach: "Alexis Matteo", stadium: "Antonio Candini", capacity: 11000, members: 8000, formation: "4-4-2" }
};

const POSITION_MAP = {
    'Goalkeeper': 'GK',
    'Defender': 'DEF',
    'Midfielder': 'MID',
    'Forward': 'FWD'
};

const INITIAL_STATS_JS = `{
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    gf: 0,
    gc: 0,
    pts: 0,
    goalDiff: 0
}`;

// Current averages and basic info (copied from current teams.ts manually to preserve then)
const TEAM_BASICS = {
    "boca": { name: 'Boca Juniors', shortName: 'BOC', zone: 'A', averages: { pts2024: 67, pj2024: 41, pts2025: 62, pj2025: 32 } },
    "central-cba": { name: 'Central Córdoba', shortName: 'CCO', zone: 'A', averages: { pts2024: 42, pj2024: 41, pts2025: 42, pj2025: 32 } },
    "defensa": { name: 'Defensa y Justicia', shortName: 'DYJ', zone: 'A', averages: { pts2024: 58, pj2024: 41, pts2025: 38, pj2025: 32 } },
    "riestra": { name: 'Dep. Riestra', shortName: 'RIE', zone: 'A', averages: { pts2024: 48, pj2024: 41, pts2025: 52, pj2025: 32 } },
    "estudiantes": { name: 'Estudiantes (LP)', shortName: 'EST', zone: 'A', averages: { pts2024: 63, pj2024: 41, pts2025: 42, pj2025: 32 } },
    "gimnasia-m": { name: 'Gimnasia (M)', shortName: 'GIM', zone: 'A', averages: { pts2024: null, pj2024: 0, pts2025: null, pj2025: 0 } },
    "independiente": { name: 'Independiente', shortName: 'IND', zone: 'A', averages: { pts2024: 63, pj2024: 41, pts2025: 47, pj2025: 32 } },
    "instituto": { name: 'Instituto', shortName: 'INS', zone: 'A', averages: { pts2024: 53, pj2024: 41, pts2025: 34, pj2025: 32 } },
    "lanus": { name: 'Lanús', shortName: 'LAN', zone: 'A', averages: { pts2024: 59, pj2024: 41, pts2025: 50, pj2025: 32 } },
    "newells": { name: 'Newell\'s Old Boys', shortName: 'NOB', zone: 'A', averages: { pts2024: 49, pj2024: 41, pts2025: 33, pj2025: 32 } },
    "platense": { name: 'Platense', shortName: 'PLA', zone: 'A', averages: { pts2024: 57, pj2024: 41, pts2025: 35, pj2025: 32 } },
    "san-lorenzo": { name: 'San Lorenzo', shortName: 'SLO', zone: 'A', averages: { pts2024: 45, pj2024: 41, pts2025: 51, pj2025: 32 } },
    "talleres": { name: 'Talleres (C)', shortName: 'TAL', zone: 'A', averages: { pts2024: 72, pj2024: 41, pts2025: 34, pj2025: 32 } },
    "union": { name: 'Unión', shortName: 'UNI', zone: 'A', averages: { pts2024: 60, pj2024: 41, pts2025: 39, pj2025: 32 } },
    "velez": { name: 'Vélez Sarsfield', shortName: 'VEL', zone: 'A', averages: { pts2024: 76, pj2024: 41, pts2025: 40, pj2025: 32 } },
    "aldosivi": { name: 'Aldosivi', shortName: 'ALD', zone: 'B', averages: { pts2024: null, pj2024: 0, pts2025: 33, pj2025: 32 } },
    "argentinos": { name: 'Argentinos Jrs', shortName: 'ARG', zone: 'B', averages: { pts2024: 56, pj2024: 41, pts2025: 57, pj2025: 32 } },
    "atletico": { name: 'Atl. Tucumán', shortName: 'ATU', zone: 'B', averages: { pts2024: 50, pj2024: 41, pts2025: 34, pj2025: 32 } },
    "banfield": { name: 'Banfield', shortName: 'BAN', zone: 'B', averages: { pts2024: 41, pj2024: 41, pts2025: 35, pj2025: 32 } },
    "barracas": { name: 'Barracas Central', shortName: 'BAR', zone: 'B', averages: { pts2024: 49, pj2024: 41, pts2025: 49, pj2025: 32 } },
    "belgrano": { name: 'Belgrano', shortName: 'BEL', zone: 'B', averages: { pts2024: 49, pj2024: 41, pts2025: 37, pj2025: 32 } },
    "estudiantes-rc": { name: 'Estudiantes (RC)', shortName: 'ERC', zone: 'B', averages: { pts2024: null, pj2024: 0, pts2025: null, pj2025: 0 } },
    "gimnasia-lp": { name: 'Gimnasia (LP)', shortName: 'GEL', zone: 'B', averages: { pts2024: 48, pj2024: 41, pts2025: 38, pj2025: 32 } },
    "huracan": { name: 'Huracán', shortName: 'HUR', zone: 'B', averages: { pts2024: 62, pj2024: 41, pts2025: 47, pj2025: 32 } },
    "ind-rivadavia": { name: 'Ind. Rivadavia', shortName: 'INR', zone: 'B', averages: { pts2024: 46, pj2024: 41, pts2025: 43, pj2025: 32 } },
    "racing": { name: 'Racing Club', shortName: 'RAC', zone: 'B', averages: { pts2024: 70, pj2024: 41, pts2025: 53, pj2025: 32 } },
    "river": { name: 'River Plate', shortName: 'RIV', zone: 'B', averages: { pts2024: 70, pj2024: 41, pts2025: 53, pj2025: 32 } },
    "rosario": { name: 'Rosario Central', shortName: 'CEN', zone: 'B', averages: { pts2024: 47, pj2024: 41, pts2025: 66, pj2025: 32 } },
    "sarmiento": { name: 'Sarmiento', shortName: 'SAR', zone: 'B', averages: { pts2024: 35, pj2024: 41, pts2025: 35, pj2025: 32 } },
    "tigre": { name: 'Tigre', shortName: 'TIG', zone: 'B', averages: { pts2024: 39, pj2024: 41, pts2025: 49, pj2025: 32 } }
};

const processedTeams = [];

for (const id of Object.keys(TEAM_BASICS)) {
    const filePath = path.join(ROSTERS_DIR, `${id}.json`);
    if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        continue;
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const meta = METADATA[id] || {};
    const basics = TEAM_BASICS[id];

    const athletes = data.athletes || data.team?.athletes || [];
    const players = athletes.map(athlete => {
        const pos = POSITION_MAP[athlete.position?.displayName] || 'MID';
        return {
            id: athlete.slug || athlete.id,
            name: athlete.displayName || athlete.fullName,
            position: pos,
            age: athlete.age || 25,
            goals: 0
        };
    });

    processedTeams.push({
        ...basics,
        id,
        logo: `https://a.espncdn.com/i/teamlogos/soccer/500/${data.team?.id || 0}.png`,
        coach: meta.coach || 'Director Técnico',
        stadium: meta.stadium || 'Estadio',
        stadiumCapacity: meta.capacity || 20000,
        membersCount: meta.members || 10000,
        formation: meta.formation || '4-4-2',
        stats: 'INITIAL_STATS',
        players
    });
}

let tsContent = `import type { Team } from '../types';

const INITIAL_STATS = ${INITIAL_STATS_JS};

export const TEAMS: Team[] = [\n`;

processedTeams.forEach(team => {
    tsContent += `    {\n`;
    tsContent += `        id: '${team.id}',\n`;
    tsContent += `        name: '${team.name.replace(/'/g, "\\'")}',\n`;
    tsContent += `        shortName: '${team.shortName}',\n`;
    tsContent += `        logo: '${team.logo}',\n`;
    tsContent += `        zone: '${team.zone}',\n`;
    tsContent += `        coach: '${team.coach}',\n`;
    tsContent += `        stadium: '${team.stadium}',\n`;
    tsContent += `        stadiumCapacity: ${team.stadiumCapacity},\n`;
    tsContent += `        membersCount: ${team.membersCount},\n`;
    tsContent += `        formation: '${team.formation}',\n`;
    tsContent += `        stats: { ...INITIAL_STATS },\n`;
    tsContent += `        averages: ${JSON.stringify(team.averages)},\n`;
    tsContent += `        players: [\n`;
    team.players.forEach(p => {
        tsContent += `            { id: '${p.id}', name: '${p.name.replace(/'/g, "\\'")}', position: '${p.position}', age: ${p.age}, goals: 0 },\n`;
    });
    tsContent += `        ]\n`;
    tsContent += `    },\n`;
});

tsContent += `];\n`;

fs.writeFileSync(OUTPUT_FILE, tsContent);
console.log('Successfully generated src/data/teams.ts with full rosters!');
