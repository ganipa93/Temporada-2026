import type { Match, Team } from '@/lib/types';

// Helper map to normalize names to IDs (Same as Apertura)
const TEAM_NAME_MAP: Record<string, string> = {
    'Aldosivi': 'aldosivi',
    'Defensa y Justicia': 'defensa',
    'Boca': 'boca',
    'Deportivo Riestra': 'riestra',
    'Independiente': 'independiente',
    'Estudiantes': 'estudiantes',
    'Talleres': 'talleres',
    'Newell’s': 'newells',
    'Newell\'s': 'newells',
    'Newell´s': 'newells',
    'Instituto': 'instituto',
    'Vélez': 'velez',
    'Unión': 'union',
    'Platense': 'platense',
    'San Lorenzo': 'san-lorenzo',
    'Lanús': 'lanus',
    'Central Córdoba': 'central-cba',
    'Central Córdboa': 'central-cba', // Typo in source
    'Gimnasia (Mza.)': 'gimnasia-m',
    'Gimnasia Mza.': 'gimnasia-m',
    'Barracas Central': 'barracas',
    'River': 'river',
    'Gimnasia': 'gimnasia-lp',
    'Racing': 'racing',
    'Rosario Central': 'rosario',
    'Belgrano': 'belgrano',
    'Tigre': 'tigre',
    'Estudiantes (Río Cuarto)': 'estudiantes-rc',
    'Estudiantes (Rio Cuarto)': 'estudiantes-rc',
    'Estudiantes de Río Cuarto': 'estudiantes-rc',
    'Argentinos': 'argentinos',
    'Argentinos Juniors': 'argentinos',
    'Sarmiento': 'sarmiento',
    'Banfield': 'banfield',
    'Huracán': 'huracan',
    'Independiente Rivadavia Mza.': 'ind-rivadavia',
    'Independiente Rivadavia (Mza.)': 'ind-rivadavia',
    'Independiente Rivadavia Mza': 'ind-rivadavia',
    'Atlético Tucumán': 'atletico'
};

const getTeamId = (name: string): string => {
    const trimmed = name.trim();
    const id = TEAM_NAME_MAP[trimmed];
    if (!id) {
        console.warn(`Unknown team name in Clausura fixture: "${trimmed}"`);
        return '';
    }
    return id;
};

// Raw Schedule Data for Clausura
const SCHEDULE_DATA = [
    {
        round: 1,
        interzonal: ['Defensa y Justicia', 'Aldosivi'],
        zoneA: [
            ['Deportivo Riestra', 'Boca'],
            ['Estudiantes', 'Independiente'],
            ['Newell’s', 'Talleres'],
            ['Vélez', 'Instituto'],
            ['Platense', 'Unión'],
            ['Lanús', 'San Lorenzo'],
            ['Gimnasia (Mza.)', 'Central Córdoba']
        ],
        zoneB: [
            ['River', 'Barracas Central'],
            ['Racing', 'Gimnasia'],
            ['Belgrano', 'Rosario Central'],
            ['Estudiantes (Río Cuarto)', 'Tigre'],
            ['Sarmiento', 'Argentinos'],
            ['Huracán', 'Banfield'],
            ['Atlético Tucumán', 'Independiente Rivadavia Mza.']
        ]
    },
    {
        round: 2,
        interzonal: ['Central Córdoba', 'Atlético Tucumán'],
        zoneA: [
            ['San Lorenzo', 'Gimnasia (Mza.)'],
            ['Unión', 'Lanús'],
            ['Instituto', 'Platense'],
            ['Talleres', 'Vélez'],
            ['Independiente', 'Newell’s'],
            ['Boca', 'Estudiantes'],
            ['Defensa y Justicia', 'Deportivo Riestra']
        ],
        zoneB: [
            ['Independiente Rivadavia Mza.', 'Huracán'],
            ['Banfield', 'Sarmiento'],
            ['Argentinos', 'Estudiantes (Río Cuarto)'],
            ['Tigre', 'Belgrano'],
            ['Rosario Central', 'Racing'],
            ['Gimnasia', 'River'],
            ['Barracas Central', 'Aldosivi']
        ]
    },
    {
        round: 3,
        interzonal: ['Deportivo Riestra', 'Barracas Central'],
        zoneA: [
            ['Estudiantes', 'Defensa y Justicia'],
            ['Newell’s', 'Boca'],
            ['Vélez', 'Independiente'],
            ['Platense', 'Talleres'],
            ['Lanús', 'Instituto'],
            ['Gimnasia (Mza.)', 'Unión'],
            ['Central Córdoba', 'San Lorenzo']
        ],
        zoneB: [
            ['Aldosivi', 'Gimnasia'],
            ['River', 'Rosario Central'],
            ['Racing', 'Tigre'],
            ['Belgrano', 'Argentinos'],
            ['Estudiantes (Río Cuarto)', 'Banfield'],
            ['Sarmiento', 'Independiente Rivadavia Mza.'],
            ['Huracán', 'Atlético Tucumán']
        ]
    },
    {
        round: 4,
        interzonal: ['San Lorenzo', 'Huracán'],
        zoneA: [
            ['Unión', 'Central Córdoba'],
            ['Instituto', 'Gimnasia (Mza.)'],
            ['Talleres', 'Lanús'],
            ['Independiente', 'Platense'],
            ['Boca', 'Vélez'],
            ['Defensa y Justicia', 'Newell’s'],
            ['Deportivo Riestra', 'Estudiantes']
        ],
        zoneB: [
            ['Atlético Tucumán', 'Sarmiento'],
            ['Independiente Rivadavia (Mza.)', 'Estudiantes (Río Cuarto)'],
            ['Banfield', 'Belgrano'],
            ['Argentinos', 'Racing'],
            ['Tigre', 'River'],
            ['Rosario Central', 'Aldosivi'],
            ['Gimnasia', 'Barracas Central']
        ]
    },
    {
        round: 5,
        interzonal: ['Estudiantes', 'Gimnasia'],
        zoneA: [
            ['Newell’s', 'Deportivo Riestra'],
            ['Vélez', 'Defensa y Justicia'],
            ['Platense', 'Boca'],
            ['Lanús', 'Independiente'],
            ['Gimnasia (Mza.)', 'Talleres'],
            ['Central Córdoba', 'Instituto'],
            ['San Lorenzo', 'Unión']
        ],
        zoneB: [
            ['Barracas Central', 'Rosario Central'],
            ['Aldosivi', 'Tigre'],
            ['River', 'Argentinos'],
            ['Racing', 'Banfield'],
            ['Belgrano', 'Independiente Rivadavia Mza.'],
            ['Estudiantes (Río Cuarto)', 'Atlético Tucumán'],
            ['Sarmiento', 'Huracán']
        ]
    },
    {
        round: 6,
        isClassics: true,
        matches: [
            ['River', 'Vélez'],
            ['Barracas Central', 'Platense'],
            ['Talleres', 'Rosario Central'],
            ['Sarmiento', 'Estudiantes'],
            ['Belgrano', 'Defensa y Justicia'],
            ['Lanús', 'Argentinos'],
            ['Racing', 'Boca'],
            ['Independiente', 'Independiente Rivadavia Mza.'],
            ['Aldosivi', 'Unión'],
            ['Atlético Tucumán', 'Instituto'],
            ['Estudiantes (Río Cuarto)', 'San Lorenzo'],
            ['Gimnasia', 'Gimnasia (Mza.)'],
            ['Tigre', 'Central Córdoba'],
            ['Huracán', 'Deportivo Riestra'],
            ['Newell’s', 'Banfield']
        ]
    },
    {
        round: 7,
        interzonal: ['Unión', 'Sarmiento'],
        zoneA: [
            ['Instituto', 'San Lorenzo'],
            ['Talleres', 'Central Córdoba'],
            ['Independiente', 'Gimnasia (Mza.)'],
            ['Boca', 'Lanús'],
            ['Defensa y Justicia', 'Platense'],
            ['Deportivo Riestra', 'Vélez'],
            ['Estudiantes', 'Newell’s']
        ],
        zoneB: [
            ['Huracán', 'Estudiantes (Río Cuarto)'],
            ['Atlético Tucumán', 'Belgrano'],
            ['Independiente Rivadavia Mza.', 'Racing'],
            ['Banfield', 'River'],
            ['Argentinos', 'Aldosivi'],
            ['Tigre', 'Barracas Central'],
            ['Rosario Central', 'Gimnasia']
        ]
    },
    {
        round: 8,
        interzonal: ['Rosario Central', 'Newell’s'],
        zoneA: [
            ['Vélez', 'Estudiantes'],
            ['Platense', 'Deportivo Riestra'],
            ['Lanús', 'Defensa y Justicia'],
            ['Gimnasia (Mza.)', 'Boca'],
            ['Central Córdoba', 'Independiente'],
            ['San Lorenzo', 'Talleres'],
            ['Unión', 'Instituto']
        ],
        zoneB: [
            ['Gimnasia', 'Tigre'],
            ['Barracas Central', 'Argentinos'],
            ['Aldosivi', 'Banfield'],
            ['River', 'Independiente Rivadavia Mza.'],
            ['Racing', 'Atlético Tucumán'],
            ['Belgrano', 'Huracán'],
            ['Estudiantes (Río Cuarto)', 'Sarmiento']
        ]
    },
    {
        round: 9,
        interzonal: ['Instituto', 'Estudiantes (Río Cuarto)'],
        zoneA: [
            ['Talleres', 'Unión'],
            ['Independiente', 'San Lorenzo'],
            ['Boca', 'Central Córdoba'],
            ['Defensa y Justicia', 'Gimnasia (Mza.)'],
            ['Deportivo Riestra', 'Lanús'],
            ['Estudiantes', 'Platense'],
            ['Newell’s', 'Vélez']
        ],
        zoneB: [
            ['Sarmiento', 'Belgrano'],
            ['Huracán', 'Racing'],
            ['Atlético Tucumán', 'River'],
            ['Independiente Rivadavia Mza.', 'Aldosivi'],
            ['Banfield', 'Barracas Central'],
            ['Argentinos', 'Gimnasia'],
            ['Tigre', 'Rosario Central']
        ]
    },
    {
        round: 10,
        interzonal: ['Vélez', 'Tigre'],
        zoneA: [
            ['Platense', 'Newell’s'],
            ['Lanús', 'Estudiantes'],
            ['Gimnasia (Mza.)', 'Deportivo Riestra'],
            ['Central Córdboa', 'Defensa y Justicia'],
            ['San Lorenzo', 'Boca'],
            ['Unión', 'Independiente'],
            ['Instituto', 'Talleres']
        ],
        zoneB: [
            ['Rosario Central', 'Argentinos'],
            ['Gimnasia', 'Banfield'],
            ['Barracas Central', 'Independiente Rivadavia Mza.'],
            ['Aldosivi', 'Atlético Tucumán'],
            ['River', 'Huracán'],
            ['Racing', 'Sarmiento'],
            ['Belgrano', 'Estudiantes (Río Cuarto)']
        ]
    },
    {
        round: 11,
        interzonal: ['Talleres', 'Belgrano'],
        zoneA: [
            ['Independiente', 'Instituto'],
            ['Boca', 'Unión'],
            ['Defensa y Justicia', 'San Lorenzo'],
            ['Deportivo Riestra', 'Central Córdoba'],
            ['Estudiantes', 'Gimnasia Mza.'],
            ['Newell’s', 'Lanús'],
            ['Vélez', 'Platense']
        ],
        zoneB: [
            ['Estudiantes (Río Cuarto)', 'Racing'],
            ['Sarmiento', 'River'],
            ['Huracán', 'Aldosivi'],
            ['Atlético Tucumán', 'Barracas Central'],
            ['Independiente Rivadavia Mza.', 'Gimnasia'],
            ['Banfield', 'Rosario Central'],
            ['Argentinos', 'Tigre']
        ]
    },
    {
        round: 12,
        interzonal: ['Platense', 'Argentinos'],
        zoneA: [
            ['Lanús', 'Vélez'],
            ['Gimnasia Mza.', 'Newell’s'],
            ['Central Córdoba', 'Estudiantes'],
            ['San Lorenzo', 'Deportivo Riestra'],
            ['Unión', 'Defensa y Justicia'],
            ['Instituto', 'Boca'],
            ['Talleres', 'Independiente']
        ],
        zoneB: [
            ['Tigre', 'Banfield'],
            ['Rosario Central', 'Independiente Rivadavia Mza.'],
            ['Gimnasia', 'Atlético Tucumán'],
            ['Barracas Central', 'Huracán'],
            ['Aldosivi', 'Sarmiento'],
            ['River', 'Estudiantes (Río Cuarto)'],
            ['Racing', 'Belgrano']
        ]
    },
    {
        round: 13,
        interzonal: ['Racing', 'Independiente'],
        zoneA: [
            ['Boca', 'Talleres'],
            ['Defensa y Justicia', 'Instituto'],
            ['Deportivo Riestra', 'Unión'],
            ['Estudiantes', 'San Lorenzo'],
            ['Newell’s', 'Central Córdoba'],
            ['Vélez', 'Gimnasia (Mza.)'],
            ['Platense', 'Lanús']
        ],
        zoneB: [
            ['Belgrano', 'River'],
            ['Estudiantes (Río Cuarto)', 'Aldosivi'],
            ['Sarmiento', 'Barracas Central'],
            ['Huracán', 'Gimnasia'],
            ['Atlético Tucumán', 'Rosario Central'],
            ['Independiente Rivadavia Mza.', 'Tigre'],
            ['Banfield', 'Argentinos']
        ]
    },
    {
        round: 14,
        interzonal: ['Banfield', 'Lanús'],
        zoneA: [
            ['Gimnasia (Mza.)', 'Platense'],
            ['Central Córdoba', 'Vélez'],
            ['San Lorenzo', 'Newell’s'],
            ['Unión', 'Estudiantes'],
            ['Instituto', 'Deportivo Riestra'],
            ['Talleres', 'Defensa y Justicia'],
            ['Independiente', 'Boca']
        ],
        zoneB: [
            ['Argentinos', 'Independiente Rivadavia Mza.'],
            ['Tigre', 'Atlético Tucumán'],
            ['Rosario Central', 'Huracán'],
            ['Gimnasia', 'Sarmiento'],
            ['Barracas Central', 'Estudiantes (Río Cuarto)'],
            ['Aldosivi', 'Belgrano'],
            ['River', 'Racing']
        ]
    },
    {
        round: 15,
        interzonal: ['Boca', 'River'],
        zoneA: [
            ['Defensa y Justicia', 'Independiente'],
            ['Deportivo Riestra', 'Talleres'],
            ['Estudiantes', 'Instituto'],
            ['Newell’s', 'Unión'],
            ['Vélez', 'San Lorenzo'],
            ['Platense', 'Central Córdoba'],
            ['Lanús', 'Gimnasia (Mza.)']
        ],
        zoneB: [
            ['Racing', 'Aldosivi'],
            ['Belgrano', 'Barracas Central'],
            ['Estudiantes de Río Cuarto', 'Gimnasia'],
            ['Sarmiento', 'Rosario Central'],
            ['Huracán', 'Tigre'],
            ['Atlético Tucumán', 'Argentinos Juniors'],
            ['Independiente Rivadavia Mza.', 'Banfield']
        ]
    },
    {
        round: 16,
        interzonal: ['Gimnasia (Mza.)', 'Independiente Rivadavia Mza.'],
        zoneA: [
            ['Central Córdoba', 'Lanús'],
            ['San Lorenzo', 'Platense'],
            ['Unión', 'Vélez'],
            ['Instituto', 'Newell’s'],
            ['Talleres', 'Estudiantes'],
            ['Independiente', 'Deportivo Riestra'],
            ['Boca', 'Defensa y Justicia']
        ],
        zoneB: [
            ['Banfield', 'Atlético Tucumán'],
            ['Argentinos', 'Huracán'],
            ['Tigre', 'Sarmiento'],
            ['Rosario Central', 'Estudiantes (Río Cuarto)'],
            ['Gimnasia', 'Belgrano'],
            ['Barracas Central', 'Racing'],
            ['Aldosivi', 'River']
        ]
    }
];

export const generateClausuraFixtures = (_teams: Team[]): Match[] => {
    const matches: Match[] = [];
    let matchIdCounter = 1000; // Start IDs at 1000 to avoid collision with Apertura

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
                    tournament: 'clausura'
                });
            }
        };

        if (roundData.isClassics && roundData.matches) {
            roundData.matches.forEach(pair => {
                pushMatch(pair[0], pair[1], 'interzonal_special');
            });
        } else {
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

