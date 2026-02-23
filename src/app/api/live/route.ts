import { NextResponse } from 'next/server';

const API_HOST = 'v3.football.api-sports.io';
const API_KEY = process.env.RAPIDAPI_KEY || '';

export async function GET() {
    if (!API_KEY || API_KEY === 'your_api_key_here') {
        return NextResponse.json({ fixtures: [], source: 'mock', message: 'No live matches (mock mode)' });
    }

    try {
        const res = await fetch(`https://${API_HOST}/fixtures?live=all&league=128`, {
            headers: { 'x-rapidapi-host': API_HOST, 'x-rapidapi-key': API_KEY },
            cache: 'no-store',
        });

        const data = await res.json();

        if (data.errors && Object.keys(data.errors).length > 0) {
            console.error('[API Live] API Error:', data.errors);
            return NextResponse.json({ error: 'API Error', details: data.errors, fixtures: [] }, { status: 403 });
        }

        return NextResponse.json({
            fixtures: data.response ?? [],
            source: 'api-football',
        });
    } catch (err) {
        console.error('[API Live] Fetch Error:', err);
        return NextResponse.json({ error: 'Failed to fetch live', fixtures: [] }, { status: 500 });
    }
}
