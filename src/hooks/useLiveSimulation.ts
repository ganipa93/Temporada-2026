import { useState, useRef, useCallback, useEffect } from 'react';
import type { Match, Team } from '@/lib/types';

/* ─── Event Types ─── */
export interface MatchEvent {
    minute: number;
    type: 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'halftime' | 'kickoff' | 'fulltime';
    teamId: string;
    playerName?: string;
    description: string;
}

export interface LiveMatch {
    matchId: string;
    homeTeamId: string;
    awayTeamId: string;
    homeScore: number;
    awayScore: number;
    minute: number;
    status: 'upcoming' | 'kickoff' | 'first_half' | 'halftime' | 'second_half' | 'fulltime';
    events: MatchEvent[];
}

interface UseLiveSimulationReturn {
    liveMatches: LiveMatch[];
    isSimulating: boolean;
    startLive: () => void;
    pauseLive: () => void;
    currentMinute: number;
    /** Updated matches array with live scores injected */
    matchesWithLive: Match[];
}

/* ─── Player name pool (realistic Argentine names) ─── */
const FIRST_NAMES = ['Matías', 'Lucas', 'Santiago', 'Franco', 'Nicolás', 'Tomás', 'Juan', 'Agustín', 'Facundo', 'Maximiliano', 'Gonzalo', 'Lautaro', 'Lionel', 'Enzo', 'Julián', 'Alexis', 'Exequiel', 'Ángel', 'Leandro', 'Cristian'];
const LAST_NAMES = ['González', 'Rodríguez', 'Fernández', 'López', 'Martínez', 'García', 'Romero', 'Díaz', 'Sosa', 'Álvarez', 'Torres', 'Pérez', 'Sánchez', 'Medina', 'Ramírez', 'Acosta', 'Méndez', 'Herrera', 'Molina', 'Castro'];

const randomName = () =>
    `${FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]} ${LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]}`;

/**
 * Live simulation hook: takes a round's matches and simulates them
 * minute-by-minute with events. Each "minute" ticks every ~400ms real time.
 */
export function useLiveSimulation(
    allMatches: Match[],
    _teams: Team[],
    tournament: 'apertura' | 'clausura',
    round: number,
): UseLiveSimulationReturn {
    const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([]);
    const [isSimulating, setIsSimulating] = useState(false);
    const [currentMinute, setCurrentMinute] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
    const eventsScheduleRef = useRef<Record<string, { minute: number; type: MatchEvent['type']; side: 'home' | 'away' }[]>>({});

    // Matches for this round that aren't played yet
    const roundMatches = allMatches.filter(
        m => m.tournament === tournament && m.round === round && !m.isPlayed
    );

    // Pre-generate events for each match
    const generateEvents = useCallback(() => {
        const schedule: typeof eventsScheduleRef.current = {};

        roundMatches.forEach(m => {
            const events: { minute: number; type: MatchEvent['type']; side: 'home' | 'away' }[] = [];

            // Goals: home 0-3, away 0-2 (same distribution as simulator)
            const homeGoals = Math.floor(Math.random() * 4);
            const awayGoals = Math.floor(Math.random() * 3);

            for (let i = 0; i < homeGoals; i++) {
                events.push({ minute: Math.floor(Math.random() * 88) + 2, type: 'goal', side: 'home' });
            }
            for (let i = 0; i < awayGoals; i++) {
                events.push({ minute: Math.floor(Math.random() * 88) + 2, type: 'goal', side: 'away' });
            }

            // Cards: 0-3 yellows per match
            const numYellows = Math.floor(Math.random() * 4);
            for (let i = 0; i < numYellows; i++) {
                events.push({
                    minute: Math.floor(Math.random() * 85) + 5,
                    type: 'yellow_card',
                    side: Math.random() > 0.5 ? 'home' : 'away',
                });
            }

            // Maybe a red card (10% chance)
            if (Math.random() < 0.1) {
                events.push({
                    minute: Math.floor(Math.random() * 70) + 20,
                    type: 'red_card',
                    side: Math.random() > 0.5 ? 'home' : 'away',
                });
            }

            events.sort((a, b) => a.minute - b.minute);
            schedule[m.id] = events;
        });

        eventsScheduleRef.current = schedule;
    }, [roundMatches]);

    const startLive = useCallback(() => {
        if (roundMatches.length === 0) return;

        generateEvents();

        // Initialize live matches
        const initial: LiveMatch[] = roundMatches.map(m => ({
            matchId: m.id,
            homeTeamId: m.homeTeamId,
            awayTeamId: m.awayTeamId,
            homeScore: 0,
            awayScore: 0,
            minute: 0,
            status: 'kickoff' as const,
            events: [{
                minute: 0,
                type: 'kickoff' as const,
                teamId: '',
                description: '¡Arranca el partido!',
            }],
        }));

        setLiveMatches(initial);
        setCurrentMinute(0);
        setIsSimulating(true);

        // Tick every 400ms = 1 match minute
        intervalRef.current = setInterval(() => {
            setCurrentMinute(prev => {
                const next = prev + 1;

                setLiveMatches(currentLive => {
                    return currentLive.map(lm => {
                        const schedule = eventsScheduleRef.current[lm.matchId] || [];
                        const newEvents = [...lm.events];
                        let hs = lm.homeScore;
                        let as_ = lm.awayScore;
                        let status = lm.status;

                        // Status transitions
                        if (next === 1) status = 'first_half';
                        if (next === 45) {
                            status = 'halftime';
                            newEvents.push({ minute: 45, type: 'halftime', teamId: '', description: 'Entretiempo' });
                        }
                        if (next === 46) status = 'second_half';
                        if (next >= 90) {
                            status = 'fulltime';
                            if (!newEvents.find(e => e.type === 'fulltime')) {
                                newEvents.push({ minute: 90, type: 'fulltime', teamId: '', description: '¡Final del partido!' });
                            }
                        }

                        // Process events at this minute
                        schedule.filter(e => e.minute === next).forEach(evt => {
                            const teamId = evt.side === 'home' ? lm.homeTeamId : lm.awayTeamId;
                            const name = randomName();

                            if (evt.type === 'goal') {
                                if (evt.side === 'home') hs++;
                                else as_++;
                                newEvents.push({
                                    minute: next, type: 'goal', teamId,
                                    playerName: name,
                                    description: `⚽ ¡GOL de ${name}!`,
                                });
                            } else if (evt.type === 'yellow_card') {
                                newEvents.push({
                                    minute: next, type: 'yellow_card', teamId,
                                    playerName: name,
                                    description: `🟨 Tarjeta amarilla para ${name}`,
                                });
                            } else if (evt.type === 'red_card') {
                                newEvents.push({
                                    minute: next, type: 'red_card', teamId,
                                    playerName: name,
                                    description: `🟥 ¡Roja directa para ${name}!`,
                                });
                            }
                        });

                        return { ...lm, minute: next, homeScore: hs, awayScore: as_, status, events: newEvents };
                    });
                });

                // Stop at minute 93 (extra time buffer)
                if (next >= 93) {
                    clearInterval(intervalRef.current);
                    setIsSimulating(false);
                }

                return next;
            });
        }, 400);
    }, [roundMatches, generateEvents]);

    const pauseLive = useCallback(() => {
        clearInterval(intervalRef.current);
        setIsSimulating(false);
    }, []);

    // Cleanup
    useEffect(() => () => clearInterval(intervalRef.current), []);

    // Build matchesWithLive: inject live scores into the full match list
    const matchesWithLive = allMatches.map(m => {
        const live = liveMatches.find(lm => lm.matchId === m.id);
        if (live && (live.status === 'fulltime' || live.minute > 0)) {
            return {
                ...m,
                homeScore: live.homeScore,
                awayScore: live.awayScore,
                isPlayed: live.status === 'fulltime',
            };
        }
        return m;
    });

    return { liveMatches, isSimulating, startLive, pauseLive, currentMinute, matchesWithLive };
}

