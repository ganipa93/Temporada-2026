import { NextRequest, NextResponse } from 'next/server';

/* Mock data for development without API key */
function getMockFixtures(date: string) {
    const teams = [
        { id: 1, name: 'Boca Juniors', logo: 'https://media.api-sports.io/football/teams/451.png' },
        { id: 2, name: 'River Plate', logo: 'https://media.api-sports.io/football/teams/435.png' },
        { id: 3, name: 'Racing Club', logo: 'https://media.api-sports.io/football/teams/436.png' },
        { id: 4, name: 'Independiente', logo: 'https://media.api-sports.io/football/teams/434.png' },
        { id: 5, name: 'San Lorenzo', logo: 'https://media.api-sports.io/football/teams/458.png' },
        { id: 6, name: 'Vélez Sársfield', logo: 'https://media.api-sports.io/football/teams/478.png' },
    ];

    return {
        fixtures: [
            {
                id: 1001, date: `${date}T18:00:00-03:00`, status: 'finished' as const, statusShort: 'FT', elapsed: 90,
                venue: 'La Bombonera',
                home: { ...teams[0], winner: true }, away: { ...teams[1], winner: false },
                score: { home: 2, away: 1, halftime: { home: 1, away: 0 } },
                events: [
                    { time: 23, team: 'Boca Juniors', teamId: 1, player: 'E. Cavani', type: 'Goal', detail: 'Normal Goal' },
                    { time: 58, team: 'River Plate', teamId: 2, player: 'M. Borja', type: 'Goal', detail: 'Normal Goal' },
                    { time: 78, team: 'Boca Juniors', teamId: 1, player: 'L. Langoni', type: 'Goal', detail: 'Normal Goal' },
                ],
            },
            {
                id: 1002, date: `${date}T21:00:00-03:00`, status: 'live' as const, statusShort: '2H', elapsed: 67,
                venue: 'Cilindro de Avellaneda',
                home: { ...teams[2], winner: null }, away: { ...teams[3], winner: null },
                score: { home: 1, away: 1, halftime: { home: 0, away: 1 } },
                events: [
                    { time: 34, team: 'Independiente', teamId: 4, player: 'L. Fernández', type: 'Goal', detail: 'Normal Goal' },
                    { time: 55, team: 'Racing Club', teamId: 3, player: 'A. Copetti', type: 'Goal', detail: 'Normal Goal' },
                ],
            },
            {
                id: 1003, date: `${date}T23:00:00-03:00`, status: 'upcoming' as const, statusShort: 'NS', elapsed: null,
                venue: 'Nuevo Gasómetro',
                home: { ...teams[4], winner: null }, away: { ...teams[5], winner: null },
                score: { home: null, away: null, halftime: null },
                events: [],
            },
        ],
        date,
        source: 'mock',
    };
}

export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    const requestedDate = searchParams.get('date') ?? new Date().toISOString().split('T')[0];

    return NextResponse.json(getMockFixtures(requestedDate));
}
