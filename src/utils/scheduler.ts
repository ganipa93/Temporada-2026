import type { Match, Team } from '@/lib/types';

// Helper map to normalize names to IDs
const TEAM_NAME_MAP: Record<string, string> = {
    'Aldosivi': 'aldosivi',
    'Defensa y Justicia': 'defensa',
    'Boca': 'boca',
    'Deportivo Riestra': 'riestra',
    'Independiente': 'independiente',
    'Estudiantes': 'estudiantes',
    'Talleres': 'talleres',
    'Newell’s': 'newells',
    'Newell\'s': 'newells', // Normalize variation
    'Newell´s': 'newells', // Normalize variation
    'Instituto': 'instituto',
    'Vélez': 'velez',
    'Unión': 'union',
    'Platense': 'platense',
    'San Lorenzo': 'san-lorenzo',
    'Lanús': 'lanus',
    'Central Córdoba': 'central-cba',
    'Gimnasia (Mza.)': 'gimnasia-m',
    'Barracas Central': 'barracas',
    'River': 'river',
    'Gimnasia': 'gimnasia-lp',
    'Racing': 'racing',
    'Rosario Central': 'rosario',
    'Belgrano': 'belgrano',
    'Tigre': 'tigre',
    'Estudiantes (Río Cuarto)': 'estudiantes-rc',
    'Estudiantes (Rio Cuarto)': 'estudiantes-rc', // Normalize
    'Argentinos': 'argentinos',
    'Sarmiento': 'sarmiento',
    'Banfield': 'banfield',
    'Huracán': 'huracan',
    'Independiente Rivadavia Mza.': 'ind-rivadavia',
    'Independiente Rivadavia Mza': 'ind-rivadavia', // Normalize
    'Atlético Tucumán': 'atletico'
};

const getTeamId = (name: string): string => {
    const trimmed = name.trim();
    const id = TEAM_NAME_MAP[trimmed];
    if (!id) {
        console.warn(`Unknown team name in fixture: "${trimmed}"`);
        return '';
    }
    return id;
};

// Raw Schedule Data
const SCHEDULE_DATA = [
    {
        round: 1,
        interzonal: ['Aldosivi', 'Defensa y Justicia'],
        zoneA: [
            ['Boca', 'Deportivo Riestra'],
            ['Independiente', 'Estudiantes'],
            ['Talleres', 'Newell’s'],
            ['Instituto', 'Vélez'],
            ['Unión', 'Platense'],
            ['San Lorenzo', 'Lanús'],
            ['Central Córdoba', 'Gimnasia (Mza.)']
        ],
        zoneB: [
            ['Barracas Central', 'River'],
            ['Gimnasia', 'Racing'],
            ['Rosario Central', 'Belgrano'],
            ['Tigre', 'Estudiantes (Río Cuarto)'],
            ['Argentinos', 'Sarmiento'],
            ['Banfield', 'Huracán'],
            ['Independiente Rivadavia Mza.', 'Atlético Tucumán']
        ]
    },
    {
        round: 2,
        interzonal: ['Atlético Tucumán', 'Central Córdoba'],
        zoneA: [
            ['Gimnasia (Mza.)', 'San Lorenzo'],
            ['Lanús', 'Unión'],
            ['Platense', 'Instituto'],
            ['Vélez', 'Talleres'],
            ['Newell’s', 'Independiente'],
            ['Estudiantes', 'Boca'],
            ['Deportivo Riestra', 'Defensa y Justicia']
        ],
        zoneB: [
            ['Huracán', 'Independiente Rivadavia Mza.'],
            ['Sarmiento', 'Banfield'],
            ['Estudiantes (Río Cuarto)', 'Argentinos'],
            ['Belgrano', 'Tigre'],
            ['Racing', 'Rosario Central'],
            ['River', 'Gimnasia'],
            ['Aldosivi', 'Barracas Central']
        ]
    },
    {
        round: 3,
        interzonal: ['Barracas Central', 'Deportivo Riestra'],
        zoneA: [
            ['Defensa y Justicia', 'Estudiantes'],
            ['Boca', 'Newell’s'],
            ['Independiente', 'Vélez'],
            ['Talleres', 'Platense'],
            ['Instituto', 'Lanús'],
            ['Unión', 'Gimnasia (Mza.)'],
            ['San Lorenzo', 'Central Córdoba']
        ],
        zoneB: [
            ['Gimnasia', 'Aldosivi'],
            ['Rosario Central', 'River'],
            ['Tigre', 'Racing'],
            ['Argentinos', 'Belgrano'],
            ['Banfield', 'Estudiantes (Río Cuarto)'],
            ['Independiente Rivadavia Mza.', 'Sarmiento'],
            ['Atlético Tucumán', 'Huracán']
        ]
    },
    {
        round: 4,
        interzonal: ['Huracán', 'San Lorenzo'],
        zoneA: [
            ['Central Córdoba', 'Unión'],
            ['Gimnasia (Mza.)', 'Instituto'],
            ['Lanús', 'Talleres'],
            ['Platense', 'Independiente'],
            ['Vélez', 'Boca'],
            ['Newell’s', 'Defensa y Justicia'],
            ['Estudiantes', 'Deportivo Riestra']
        ],
        zoneB: [
            ['Sarmiento', 'Atlético Tucumán'],
            ['Estudiantes (Río Cuarto)', 'Independiente Rivadavia Mza.'],
            ['Belgrano', 'Banfield'],
            ['Racing', 'Argentinos'],
            ['River', 'Tigre'],
            ['Aldosivi', 'Rosario Central'],
            ['Barracas Central', 'Gimnasia']
        ]
    },
    {
        round: 5,
        interzonal: ['Gimnasia', 'Estudiantes'],
        zoneA: [
            ['Deportivo Riestra', 'Newell’s'],
            ['Defensa y Justicia', 'Vélez'],
            ['Boca', 'Platense'],
            ['Independiente', 'Lanús'],
            ['Talleres', 'Gimnasia (Mza.)'],
            ['Instituto', 'Central Córdoba'],
            ['Unión', 'San Lorenzo']
        ],
        zoneB: [
            ['Rosario Central', 'Barracas Central'],
            ['Tigre', 'Aldosivi'],
            ['Argentinos', 'River'],
            ['Banfield', 'Racing'],
            ['Independiente Rivadavia Mza.', 'Belgrano'],
            ['Atlético Tucumán', 'Estudiantes (Río Cuarto)'],
            ['Huracán', 'Sarmiento']
        ]
    },
    {
        round: 6,
        isClassics: true,
        matches: [
            ['Vélez', 'River'],
            ['Platense', 'Barracas Central'],
            ['Rosario Central', 'Talleres'],
            ['Estudiantes', 'Sarmiento'],
            ['Defensa y Justicia', 'Belgrano'],
            ['Argentinos', 'Lanús'],
            ['Boca', 'Racing'],
            ['Independiente Rivadavia Mza.', 'Independiente'],
            ['Unión', 'Aldosivi'],
            ['Instituto', 'Atlético Tucumán'],
            ['San Lorenzo', 'Estudiantes (Río Cuarto)'],
            ['Gimnasia (Mza.)', 'Gimnasia'],
            ['Central Córdoba', 'Tigre'],
            ['Deportivo Riestra', 'Huracán'],
            ['Banfield', 'Newell’s']
        ]
    },
    {
        round: 7,
        interzonal: ['Sarmiento', 'Unión'],
        zoneA: [
            ['San Lorenzo', 'Instituto'],
            ['Central Córdoba', 'Talleres'],
            ['Gimnasia (Mza.)', 'Independiente'],
            ['Lanús', 'Boca'],
            ['Platense', 'Defensa y Justicia'],
            ['Vélez', 'Deportivo Riestra'],
            ['Newell’s', 'Estudiantes']
        ],
        zoneB: [
            ['Estudiantes (Río Cuarto)', 'Huracán'],
            ['Belgrano', 'Atlético Tucumán'],
            ['Racing', 'Independiente Rivadavia Mza.'],
            ['River', 'Banfield'],
            ['Aldosivi', 'Argentinos'],
            ['Barracas Central', 'Tigre'],
            ['Gimnasia', 'Rosario Central']
        ]
    },
    {
        round: 8,
        interzonal: ['Newell’s', 'Rosario Central'],
        zoneA: [
            ['Estudiantes', 'Vélez'],
            ['Deportivo Riestra', 'Platense'],
            ['Defensa y Justicia', 'Lanús'],
            ['Boca', 'Gimnasia (Mza.)'],
            ['Independiente', 'Central Córdoba'],
            ['Talleres', 'San Lorenzo'],
            ['Instituto', 'Unión']
        ],
        zoneB: [
            ['Tigre', 'Gimnasia'],
            ['Argentinos', 'Barracas Central'],
            ['Banfield', 'Aldosivi'],
            ['Independiente Rivadavia Mza.', 'River'],
            ['Atlético Tucumán', 'Racing'],
            ['Huracán', 'Belgrano'],
            ['Sarmiento', 'Estudiantes (Río Cuarto)']
        ]
    },
    {
        round: 9,
        interzonal: ['Estudiantes (Río Cuarto)', 'Instituto'],
        zoneA: [
            ['Unión', 'Talleres'],
            ['San Lorenzo', 'Independiente'],
            ['Central Córdoba', 'Boca'],
            ['Gimnasia (Mza.)', 'Defensa y Justicia'],
            ['Lanús', 'Deportivo Riestra'],
            ['Platense', 'Estudiantes'],
            ['Vélez', 'Newell’s']
        ],
        zoneB: [
            ['Belgrano', 'Sarmiento'],
            ['Racing', 'Huracán'],
            ['River', 'Atlético Tucumán'],
            ['Aldosivi', 'Independiente Rivadavia Mza.'],
            ['Barracas Central', 'Banfield'],
            ['Gimnasia', 'Argentinos'],
            ['Rosario Central', 'Tigre']
        ]
    },
    {
        round: 10,
        interzonal: ['Tigre', 'Vélez'],
        zoneA: [
            ['Newell’s', 'Platense'],
            ['Estudiantes', 'Lanús'],
            ['Deportivo Riestra', 'Gimnasia (Mza.)'],
            ['Defensa y Justicia', 'Central Córdoba'],
            ['Boca', 'San Lorenzo'],
            ['Independiente', 'Unión'],
            ['Talleres', 'Instituto']
        ],
        zoneB: [
            ['Argentinos', 'Rosario Central'],
            ['Banfield', 'Gimnasia'],
            ['Independiente Rivadavia Mza.', 'Barracas Central'],
            ['Atlético Tucumán', 'Aldosivi'],
            ['Huracán', 'River'],
            ['Sarmiento', 'Racing'],
            ['Estudiantes (Río Cuarto)', 'Belgrano']
        ]
    },
    {
        round: 11,
        interzonal: ['Belgrano', 'Talleres'],
        zoneA: [
            ['Instituto', 'Independiente'],
            ['Unión', 'Boca'],
            ['San Lorenzo', 'Defensa y Justicia'],
            ['Central Córdoba', 'Deportivo Riestra'],
            ['Gimnasia (Mza.)', 'Estudiantes'],
            ['Lanús', 'Newell’s'],
            ['Platense', 'Vélez']
        ],
        zoneB: [
            ['Racing', 'Estudiantes (Río Cuarto)'],
            ['River', 'Sarmiento'],
            ['Aldosivi', 'Huracán'],
            ['Barracas Central', 'Atlético Tucumán'],
            ['Gimnasia', 'Independiente Rivadavia Mza.'],
            ['Rosario Central', 'Banfield'],
            ['Tigre', 'Argentinos']
        ]
    },
    {
        round: 12,
        interzonal: ['Argentinos', 'Platense'],
        zoneA: [
            ['Vélez', 'Lanús'],
            ['Newell’s', 'Gimnasia (Mza.)'],
            ['Estudiantes', 'Central Córdoba'],
            ['Deportivo Riestra', 'San Lorenzo'],
            ['Defensa y Justicia', 'Unión'],
            ['Boca', 'Instituto'],
            ['Independiente', 'Talleres']
        ],
        zoneB: [
            ['Banfield', 'Tigre'],
            ['Independiente Rivadavia Mza.', 'Rosario Central'],
            ['Atlético Tucumán', 'Gimnasia'],
            ['Huracán', 'Barracas Central'],
            ['Sarmiento', 'Aldosivi'],
            ['Estudiantes (Río Cuarto)', 'River'],
            ['Belgrano', 'Racing']
        ]
    },
    {
        round: 13,
        interzonal: ['Independiente', 'Racing'],
        zoneA: [
            ['Talleres', 'Boca'],
            ['Instituto', 'Defensa y Justicia'],
            ['Unión', 'Deportivo Riestra'],
            ['San Lorenzo', 'Estudiantes'],
            ['Central Córdoba', 'Newell’s'],
            ['Gimnasia (Mza.)', 'Vélez'],
            ['Lanús', 'Platense']
        ],
        zoneB: [
            ['River', 'Belgrano'],
            ['Aldosivi', 'Estudiantes (Río Cuarto)'],
            ['Barracas Central', 'Sarmiento'],
            ['Gimnasia', 'Huracán'],
            ['Rosario Central', 'Atlético Tucumán'],
            ['Tigre', 'Independiente Rivadavia Mza.'],
            ['Argentinos', 'Banfield']
        ]
    },
    {
        round: 14,
        interzonal: ['Lanús', 'Banfield'],
        zoneA: [
            ['Platense', 'Gimnasia (Mza.)'],
            ['Vélez', 'Central Córdoba'],
            ['Newell’s', 'San Lorenzo'],
            ['Estudiantes', 'Unión'],
            ['Deportivo Riestra', 'Instituto'],
            ['Defensa y Justicia', 'Talleres'],
            ['Boca', 'Independiente']
        ],
        zoneB: [
            ['Independiente Rivadavia Mza.', 'Argentinos'],
            ['Atlético Tucumán', 'Tigre'],
            ['Huracán', 'Rosario Central'],
            ['Sarmiento', 'Gimnasia'],
            ['Estudiantes (Río Cuarto)', 'Barracas Central'],
            ['Belgrano', 'Aldosivi'],
            ['Racing', 'River']
        ]
    },
    {
        round: 15,
        interzonal: ['River', 'Boca'],
        zoneA: [
            ['Independiente', 'Defensa y Justicia'],
            ['Talleres', 'Deportivo Riestra'],
            ['Instituto', 'Estudiantes'],
            ['Unión', 'Newell’s'],
            ['San Lorenzo', 'Vélez'],
            ['Central Córdoba', 'Platense'],
            ['Gimnasia (Mza.)', 'Lanús']
        ],
        zoneB: [
            ['Aldosivi', 'Racing'],
            ['Barracas Central', 'Belgrano'],
            ['Gimnasia', 'Estudiantes (Río Cuarto)'],
            ['Rosario Central', 'Sarmiento'],
            ['Tigre', 'Huracán'],
            ['Argentinos', 'Atlético Tucumán'],
            ['Banfield', 'Independiente Rivadavia Mza.']
        ]
    },
    {
        round: 16,
        interzonal: ['Independiente Rivadavia Mza.', 'Gimnasia (Mza.)'],
        zoneA: [
            ['Lanús', 'Central Córdoba'],
            ['Platense', 'San Lorenzo'],
            ['Vélez', 'Unión'],
            ['Newell’s', 'Instituto'],
            ['Estudiantes', 'Talleres'],
            ['Deportivo Riestra', 'Independiente'],
            ['Defensa y Justicia', 'Boca']
        ],
        zoneB: [
            ['Atlético Tucumán', 'Banfield'],
            ['Huracán', 'Argentinos'],
            ['Sarmiento', 'Tigre'],
            ['Estudiantes (Río Cuarto)', 'Rosario Central'],
            ['Belgrano', 'Gimnasia'],
            ['Racing', 'Barracas Central'],
            ['River', 'Aldosivi']
        ]
    }
];

export const generateFixtures = (_teams: Team[]): Match[] => {
    const matches: Match[] = [];
    let matchIdCounter = 1;

    SCHEDULE_DATA.forEach(roundData => {
        const roundNum = roundData.round;

        // Helper to push match
        const pushMatch = (homeName: string, awayName: string, type: Match['type']) => {
            const homeId = getTeamId(homeName);
            const awayId = getTeamId(awayName);

            if (homeId && awayId) {
                matches.push({
                    id: String(matchIdCounter++),
                    homeTeamId: homeId,
                    awayTeamId: awayId,
                    homeScore: null,
                    awayScore: null,
                    isPlayed: false,
                    round: roundNum,
                    type: type,
                    tournament: 'apertura'
                });
            }
        };

        if (roundData.isClassics && roundData.matches) {
            // Fecha 6: All Classics/Interzonals
            roundData.matches.forEach(pair => {
                pushMatch(pair[0], pair[1], 'interzonal_special');
            });
        } else {
            // Regular Fechas
            if (roundData.interzonal) {
                pushMatch(roundData.interzonal[0], roundData.interzonal[1], 'interzonal');
            }
            if (roundData.zoneA) {
                roundData.zoneA.forEach(pair => pushMatch(pair[0], pair[1], 'regular'));
            }
            if (roundData.zoneB) {
                roundData.zoneB.forEach(pair => pushMatch(pair[0], pair[1], 'regular'));
            }
        }
    });

    return matches;
};

