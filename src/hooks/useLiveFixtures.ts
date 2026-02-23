'use client';

import { useQuery } from '@tanstack/react-query';

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

interface FixturesResponse {
    fixtures: Fixture[];
    date: string;
    source: string;
    isFallback?: boolean;
}

/**
 * TanStack Query hook to fetch fixtures from our API Route.
 * Polls every 15 seconds, pauses when tab is hidden.
 */
export function useLiveFixtures(date?: string, enabled: boolean = true) {
    const targetDate = date ?? new Date().toISOString().split('T')[0];

    return useQuery<FixturesResponse>({
        queryKey: ['fixtures', targetDate],
        queryFn: async () => {
            const res = await fetch(`/api/fixtures?date=${targetDate}&league=128`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        },
        refetchInterval: 15_000,
        refetchIntervalInBackground: false,
        staleTime: 10_000,
        placeholderData: (prev) => prev,
        enabled,
    });
}
