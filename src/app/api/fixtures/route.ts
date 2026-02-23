import { NextRequest, NextResponse } from 'next/server';

const API_HOST = 'v3.football.api-sports.io';
const API_KEY = process.env.RAPIDAPI_KEY || '';

function transformFixture(f: any) {
    const status = f.fixture?.status?.short || 'NS';
    const elapsed = f.fixture?.status?.elapsed || null;

    let localStatus: 'upcoming' | 'live' | 'halftime' | 'finished' = 'upcoming';
    if (['1H', '2H', 'ET', 'BT', 'P', 'INT'].includes(status)) localStatus = 'live';
    else if (['FT', 'AET', 'PEN', 'AWD', 'WO'].includes(status)) localStatus = 'finished';
    else if (['HT'].includes(status)) localStatus = 'halftime';

    return {
        id: f.fixture?.id,
        date: f.fixture?.date,
        status: localStatus,
        statusShort: status,
        elapsed,
        venue: f.fixture?.venue?.name || null,
        home: {
            id: f.teams?.home?.id,
            name: f.teams?.home?.name,
            logo: f.teams?.home?.logo,
            winner: f.teams?.home?.winner,
        },
        away: {
            id: f.teams?.away?.id,
            name: f.teams?.away?.name,
            logo: f.teams?.away?.logo,
            winner: f.teams?.away?.winner,
        },
        score: {
            home: f.goals?.home ?? null,
            away: f.goals?.away ?? null,
            halftime: f.score?.halftime || null,
        },
        events: (f.events || []).map((e: any) => ({
            time: e.time?.elapsed,
            extra: e.time?.extra,
            team: e.team?.name,
            teamId: e.team?.id,
            player: e.player?.name,
            assist: e.assist?.name,
            type: e.type,
            detail: e.detail,
        })),
    };
}

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
    const date = searchParams.get('date') ?? new Date().toISOString().split('T')[0];
    const league = searchParams.get('league') ?? '128';
    const season = searchParams.get('season') ?? '2026';

    if (!API_KEY || API_KEY === 'your_api_key_here') {
        return NextResponse.json(getMockFixtures(date));
    }

    try {
        const res = await fetch(
            `https://${API_HOST}/fixtures?date=${date}&league=${league}&season=${season}`,
            {
                headers: {
                    'x-rapidapi-host': API_HOST,
                    'x-rapidapi-key': API_KEY,
                },
                next: { revalidate: 30 },
            }
        );

        const data = await res.json();
        return NextResponse.json({
            fixtures: (data.response ?? []).map(transformFixture),
            date,
            source: 'api-football',
        });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch fixtures', fixtures: [] }, { status: 500 });
    }
}
