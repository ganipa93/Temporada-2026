import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;
const API_KEY = process.env.RAPIDAPI_KEY || '';

// CORS — allow Vite dev server
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }));
app.use(express.json());

/* ─── API-Football base config ─── */
const API_HOST = 'v3.football.api-sports.io';
const API_BASE = `https://${API_HOST}`;

const headers = {
    'x-rapidapi-host': API_HOST,
    'x-rapidapi-key': API_KEY,
};

/* ─── Health check ─── */
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        hasApiKey: !!API_KEY && API_KEY !== 'your_api_key_here',
        timestamp: new Date().toISOString(),
    });
});

/* ─── GET /api/fixtures — Day fixtures for a league ─── */
app.get('/api/fixtures', async (req, res) => {
    try {
        const date = req.query.date || new Date().toISOString().split('T')[0];
        const league = req.query.league || '128'; // Liga Profesional Argentina
        const season = req.query.season || '2026';

        if (!API_KEY || API_KEY === 'your_api_key_here') {
            // Return mock data when no API key
            return res.json(getMockFixtures(String(date)));
        }

        const url = `${API_BASE}/fixtures?date=${date}&league=${league}&season=${season}`;
        const response = await fetch(url, { headers });
        const data = await response.json();

        // Transform API-Football response to our format
        const fixtures = (data.response || []).map(transformFixture);
        res.json({ fixtures, date, source: 'api-football' });
    } catch (err) {
        console.error('[API] fixtures error:', err);
        res.status(500).json({ error: 'Failed to fetch fixtures', fixtures: [] });
    }
});

/* ─── GET /api/live — Currently live fixtures ─── */
app.get('/api/live', async (_req, res) => {
    try {
        if (!API_KEY || API_KEY === 'your_api_key_here') {
            return res.json(getMockLiveFixtures());
        }

        const url = `${API_BASE}/fixtures?live=all&league=128`;
        const response = await fetch(url, { headers });
        const data = await response.json();

        const fixtures = (data.response || []).map(transformFixture);
        res.json({ fixtures, source: 'api-football' });
    } catch (err) {
        console.error('[API] live error:', err);
        res.status(500).json({ error: 'Failed to fetch live fixtures', fixtures: [] });
    }
});

/* ─── Transform API-Football fixture to clean format ─── */
function transformFixture(f) {
    const status = f.fixture?.status?.short || 'NS';
    const elapsed = f.fixture?.status?.elapsed || null;

    let localStatus = 'upcoming';
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
        events: (f.events || []).map(e => ({
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

/* ─── Mock data for development without API key ─── */
function getMockFixtures(date) {
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
                id: 1001, date: `${date}T18:00:00-03:00`, status: 'finished', statusShort: 'FT', elapsed: 90,
                home: teams[0], away: teams[1],
                score: { home: 2, away: 1, halftime: { home: 1, away: 0 } },
                events: [
                    { time: 23, team: 'Boca Juniors', teamId: 1, player: 'E. Cavani', type: 'Goal', detail: 'Normal Goal' },
                    { time: 58, team: 'River Plate', teamId: 2, player: 'M. Borja', type: 'Goal', detail: 'Normal Goal' },
                    { time: 78, team: 'Boca Juniors', teamId: 1, player: 'L. Langoni', type: 'Goal', detail: 'Normal Goal' },
                ],
            },
            {
                id: 1002, date: `${date}T21:00:00-03:00`, status: 'live', statusShort: '2H', elapsed: 67,
                home: teams[2], away: teams[3],
                score: { home: 1, away: 1, halftime: { home: 0, away: 1 } },
                events: [
                    { time: 34, team: 'Independiente', teamId: 4, player: 'L. Fernández', type: 'Goal', detail: 'Normal Goal' },
                    { time: 55, team: 'Racing Club', teamId: 3, player: 'A. Copetti', type: 'Goal', detail: 'Normal Goal' },
                ],
            },
            {
                id: 1003, date: `${date}T23:00:00-03:00`, status: 'upcoming', statusShort: 'NS', elapsed: null,
                home: teams[4], away: teams[5],
                score: { home: null, away: null, halftime: null },
                events: [],
            },
        ],
        date,
        source: 'mock',
    };
}

function getMockLiveFixtures() {
    const now = new Date().toISOString();
    return {
        fixtures: [
            {
                id: 2001, date: now, status: 'live', statusShort: '1H', elapsed: 32,
                home: { id: 3, name: 'Racing Club', logo: 'https://media.api-sports.io/football/teams/436.png' },
                away: { id: 4, name: 'Independiente', logo: 'https://media.api-sports.io/football/teams/434.png' },
                score: { home: 0, away: 1, halftime: null },
                events: [
                    { time: 18, team: 'Independiente', teamId: 4, player: 'L. Fernández', type: 'Goal', detail: 'Normal Goal' },
                ],
            },
        ],
        source: 'mock',
    };
}

/* ─── Start server ─── */
app.listen(PORT, () => {
    console.log(`\n  🏟️  API Proxy running on http://localhost:${PORT}`);
    console.log(`  📡 API key: ${API_KEY && API_KEY !== 'your_api_key_here' ? 'configured ✅' : 'not set (using mock data) ⚠️'}`);
    console.log(`  🔗 Endpoints: /api/health, /api/fixtures, /api/live\n`);
});
