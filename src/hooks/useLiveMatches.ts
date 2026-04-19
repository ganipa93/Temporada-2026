import { useState, useEffect, useRef, useCallback } from 'react';

/* ─── Types ─── */
export interface FixtureTeam {
    id: number;
    name: string;
    logo: string;
    winner?: boolean | null;
}

export interface FixtureEvent {
    time: number;
    extra?: number | null;
    team: string;
    teamId: number;
    player: string;
    assist?: string | null;
    type: string;
    detail: string;
}

export interface Fixture {
    id: number;
    date: string;
    status: 'upcoming' | 'live' | 'halftime' | 'finished';
    statusShort: string;
    elapsed: number | null;
    venue: string | null;
    home: FixtureTeam;
    away: FixtureTeam;
    score: {
        home: number | null;
        away: number | null;
        halftime: { home: number; away: number } | null;
    };
    events: FixtureEvent[];
}

interface UseLiveMatchesReturn {
    fixtures: Fixture[];
    isLoading: boolean;
    error: string | null;
    lastUpdated: number | null;
    isConnected: boolean;
    refetch: () => void;
}

const API_BASE = '/api';

/**
 * Hook to poll the backend proxy for live/daily fixtures.
 * Polls every `intervalMs` (default 15s). Pauses when tab is hidden.
 */
export function useLiveMatches(
    date?: string,
    intervalMs: number = 15000,
): UseLiveMatchesReturn {
    const [fixtures, setFixtures] = useState<Fixture[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<number | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

    const fetchFixtures = useCallback(async () => {
        try {
            const dateParam = date || new Date().toISOString().split('T')[0];
            const res = await fetch(`${API_BASE}/fixtures?date=${dateParam}&league=128`);

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data = await res.json();
            setFixtures(data.fixtures || []);
            setError(null);
            setIsConnected(true);
            setLastUpdated(Date.now());
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Error de conexión';
            setError(msg);
            setIsConnected(false);
        } finally {
            setIsLoading(false);
        }
    }, [date]);

    // Initial fetch + polling
    useEffect(() => {
        fetchFixtures();

        intervalRef.current = setInterval(fetchFixtures, intervalMs);
        return () => clearInterval(intervalRef.current);
    }, [fetchFixtures, intervalMs]);

    // Pause when tab is hidden
    useEffect(() => {
        const handleVisibility = () => {
            if (document.hidden) {
                clearInterval(intervalRef.current);
            } else {
                fetchFixtures();
                intervalRef.current = setInterval(fetchFixtures, intervalMs);
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, [fetchFixtures, intervalMs]);

    return { fixtures, isLoading, error, lastUpdated, isConnected, refetch: fetchFixtures };
}
