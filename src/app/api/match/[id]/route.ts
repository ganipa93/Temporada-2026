import { NextRequest, NextResponse } from 'next/server';

const API_HOST = 'v3.football.api-sports.io';
const API_KEY = process.env.RAPIDAPI_KEY || '';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    if (!API_KEY || API_KEY === 'your_api_key_here') {
        return NextResponse.json({ fixture: null, source: 'mock' });
    }

    try {
        const res = await fetch(`https://${API_HOST}/fixtures?id=${id}`, {
            headers: { 'x-rapidapi-host': API_HOST, 'x-rapidapi-key': API_KEY },
            next: { revalidate: 15 },
        });

        const data = await res.json();
        const fixture = data.response?.[0] ?? null;
        return NextResponse.json({ fixture, source: 'api-football' });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch match', fixture: null }, { status: 500 });
    }
}
