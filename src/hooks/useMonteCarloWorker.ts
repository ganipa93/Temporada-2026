import { useState, useEffect, useRef, useCallback } from 'react';
import type { Team, Match } from '@/lib/types';
import type { TeamProjection } from '@/hooks/useMonteCarloSimulation';

interface WorkerState {
    projections: TeamProjection[];
    isRunning: boolean;
    lastUpdated: number | null;
}

/**
 * Hook to manage the Monte Carlo Web Worker.
 * Triggers recalculations when matches change and provides results reactively.
 */
export function useMonteCarloWorker(
    teams: Team[],
    matches: Match[],
    tournament: 'apertura' | 'clausura',
    numSims: number = 2000,
    enabled: boolean = true,
) {
    const [state, setState] = useState<WorkerState>({
        projections: [],
        isRunning: false,
        lastUpdated: null,
    });

    const workerRef = useRef<Worker | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    // Initialize worker
    useEffect(() => {
        const w = new Worker(
            new URL('../workers/monteCarloWorker.ts', import.meta.url),
            { type: 'module' }
        );

        w.onmessage = (e: MessageEvent<{ projections: TeamProjection[] }>) => {
            setState({
                projections: e.data.projections,
                isRunning: false,
                lastUpdated: Date.now(),
            });
        };

        w.onerror = (err) => {
            console.error('[MonteCarloWorker] Error:', err);
            setState(prev => ({ ...prev, isRunning: false }));
        };

        workerRef.current = w;
        return () => { w.terminate(); };
    }, []);

    // Trigger recalculation (debounced)
    const recalculate = useCallback(() => {
        if (!workerRef.current || !enabled || teams.length === 0) return;

        // Debounce: wait 150ms after last call
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setState(prev => ({ ...prev, isRunning: true }));

            // Serialize minimal data for worker
            const teamData = teams.map(t => ({
                id: t.id, name: t.name, shortName: t.shortName,
                logo: t.logo, zone: t.zone,
            }));
            const matchData = matches.map(m => ({
                homeTeamId: m.homeTeamId, awayTeamId: m.awayTeamId,
                homeScore: m.homeScore, awayScore: m.awayScore,
                isPlayed: m.isPlayed, tournament: m.tournament,
            }));

            workerRef.current?.postMessage({
                teams: teamData, matches: matchData, tournament, numSims,
            });
        }, 150);
    }, [teams, matches, tournament, numSims, enabled]);

    // Auto-recalculate when dependencies change
    useEffect(() => {
        recalculate();
    }, [recalculate]);

    return {
        projections: state.projections,
        isRunning: state.isRunning,
        lastUpdated: state.lastUpdated,
        recalculate,
    };
}

