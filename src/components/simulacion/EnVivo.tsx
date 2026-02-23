'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { Team, Match } from '@/lib/types';
import { useLiveSimulation, type LiveMatch } from '@/hooks/useLiveSimulation';
import { useMonteCarloWorker } from '@/hooks/useMonteCarloWorker';
import type { TeamProjection } from '@/hooks/useMonteCarloSimulation';
import { MenuFechas } from '@/components/simulacion/MenuFechas';
import { PartidoSimulado } from '@/components/simulacion/PartidoSimulado';
import { ProbabilidadesDinamicas } from '@/components/simulacion/ProbabilidadesDinamicas';
import { Play, Pause, Radio, Zap, Activity, ChevronDown, ChevronUp } from 'lucide-react';

/* ─── Events Feed (internal) ─── */
const EventsFeed: React.FC<{ liveMatches: LiveMatch[]; teams: Team[]; accentColor: string }> = React.memo(({ liveMatches, teams, accentColor }) => {
    const feedRef = useRef<HTMLDivElement>(null);
    const [showAll, setShowAll] = useState(false);

    const allEvents = useMemo(() =>
        liveMatches
            .flatMap(lm => lm.events.map(e => ({ ...e, matchId: lm.matchId })))
            .filter(e => e.type !== 'kickoff')
            .sort((a, b) => b.minute - a.minute),
        [liveMatches]
    );

    const displayed = showAll ? allEvents : allEvents.slice(0, 8);

    useEffect(() => {
        feedRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, [allEvents.length]);

    const eventIcon = (type: string) => {
        switch (type) {
            case 'goal': return '⚽';
            case 'yellow_card': return '🟨';
            case 'red_card': return '🟥';
            case 'halftime': return '⏸️';
            case 'fulltime': return '🏁';
            default: return '📋';
        }
    };

    return (
        <div className="card theme-fade overflow-hidden">
            <div className="px-4 py-2.5 flex items-center justify-between"
                style={{ borderBottom: '1px solid var(--border)', background: 'linear-gradient(135deg, var(--surface-2) 0%, var(--surface) 100%)' }}>
                <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg" style={{ background: `${accentColor}15`, color: accentColor }}>
                        <Zap size={14} />
                    </span>
                    <h4 className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text)' }}>Eventos</h4>
                </div>
                {liveMatches.length > 0 && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${accentColor}15`, color: accentColor }}>
                        {liveMatches.flatMap(lm => lm.events).filter(e => e.type === 'goal').length} goles
                    </span>
                )}
            </div>
            <div ref={feedRef} className="space-y-1 p-3 max-h-[300px] overflow-y-auto"
                style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--border) transparent' }}>
                {displayed.map((evt, i) => {
                    const team = teams.find(t => t.id === evt.teamId);
                    return (
                        <div key={`${evt.minute}-${i}`}
                            className="flex items-start gap-2 py-1.5 px-2 rounded-lg theme-fade"
                            style={{
                                background: evt.type === 'goal' ? 'rgba(74,222,128,0.06)' : 'transparent',
                                borderLeft: evt.type === 'goal' ? '2px solid var(--win)' : '2px solid transparent',
                            }}>
                            <span className="text-[10px] font-black font-mono w-6 text-center pt-0.5"
                                style={{ color: accentColor }}>{evt.minute}'</span>
                            <span className="text-sm">{eventIcon(evt.type)}</span>
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-bold" style={{ color: 'var(--text)' }}>{evt.description}</p>
                                {team && (
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <img src={team.logo} alt="" className="w-3 h-3 object-contain" />
                                        <span className="text-[9px]" style={{ color: 'var(--text-faint)' }}>{team.shortName}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                {allEvents.length === 0 && (
                    <p className="py-6 text-center text-xs" style={{ color: 'var(--text-faint)' }}>
                        Esperando eventos...
                    </p>
                )}
            </div>
            {allEvents.length > 8 && (
                <div className="px-3 pb-2 text-center">
                    <button onClick={() => setShowAll(v => !v)}
                        className="flex items-center gap-1 mx-auto text-[10px] font-bold"
                        style={{ color: accentColor }}>
                        {showAll ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        {showAll ? 'Menos' : `Ver todos (${allEvents.length})`}
                    </button>
                </div>
            )}
        </div>
    );
});
EventsFeed.displayName = 'EventsFeed';


/* ═══════════════════════════════════════════════
   SIMULACIÓN EN VIVO — Main Orchestrator
   ═══════════════════════════════════════════════ */

interface Props {
    teams: Team[];
    matches: Match[];
    tournament: 'apertura' | 'clausura';
    currentRound: number;
    onMatchesUpdate: (updatedMatches: Match[]) => void;
}

export const EnVivo: React.FC<Props> = ({ teams, matches, tournament, currentRound: initialRound, onMatchesUpdate }) => {
    const [selectedRound, setSelectedRound] = useState(initialRound);

    const accentColor = tournament === 'clausura' ? '#C084FC' : '#4FC3F7';

    // Live simulation engine for selected round
    const { liveMatches, isSimulating, startLive, pauseLive, currentMinute, matchesWithLive } =
        useLiveSimulation(matches, teams, tournament, selectedRound);

    // Worker-based Monte Carlo
    const { projections, isRunning: isRecalculating } = useMonteCarloWorker(
        teams, matchesWithLive, tournament, 2000, liveMatches.length > 0
    );

    // Previous projections for delta tracking
    const [prevProjections, setPrevProjections] = useState<TeamProjection[]>([]);
    const [prevSnapshotMinute, setPrevSnapshotMinute] = useState(0);

    useEffect(() => {
        const hasGoal = liveMatches.some(lm =>
            lm.events.some(e => e.type === 'goal' && e.minute === currentMinute)
        );
        if (hasGoal && projections.length > 0 && currentMinute !== prevSnapshotMinute) {
            setPrevProjections(projections);
            setPrevSnapshotMinute(currentMinute);
        }
    }, [currentMinute, liveMatches, projections, prevSnapshotMinute]);

    // Commit results when all matches are fulltime
    useEffect(() => {
        if (liveMatches.length > 0 && liveMatches.every(lm => lm.status === 'fulltime')) {
            onMatchesUpdate(matchesWithLive);
        }
    }, [liveMatches, matchesWithLive, onMatchesUpdate]);

    // Derived state
    const anyLive = liveMatches.some(lm => lm.status !== 'fulltime' && lm.status !== 'upcoming');
    const allFinished = liveMatches.length > 0 && liveMatches.every(lm => lm.status === 'fulltime');
    const unplayedInRound = matches.filter(
        m => m.tournament === tournament && m.round === selectedRound && !m.isPlayed
    );
    const progressPct = Math.min((currentMinute / 92) * 100, 100);

    // Reset state when switching rounds
    const handleRoundChange = (round: number) => {
        if (isSimulating) return; // Don't switch while simulating
        setSelectedRound(round);
        setPrevProjections([]);
        setPrevSnapshotMinute(0);
    };

    return (
        <div className="space-y-4">
            {/* ─── Matchday Navigation ─── */}
            <MenuFechas
                matches={matches}
                tournament={tournament}
                selectedRound={selectedRound}
                onSelectRound={handleRoundChange}
                accentColor={accentColor}
            />

            {/* ─── Header + Controls ─── */}
            <div className="card theme-fade p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Radio size={16} className={anyLive ? 'animate-pulse' : ''}
                                style={{ color: anyLive ? '#EF4444' : accentColor }} />
                            <h2 className="text-sm font-black uppercase tracking-widest" style={{ color: accentColor }}>
                                Simulación — Fecha {selectedRound}
                            </h2>
                        </div>
                        <p className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
                            {anyLive
                                ? <>
                                    <strong style={{ color: accentColor }}>Minuto {currentMinute}'</strong>
                                    {' '}· Recalculando con 2.000 simulaciones via Web Worker
                                </>
                                : allFinished
                                    ? '✅ Todos los partidos han finalizado · Resultados guardados'
                                    : `${unplayedInRound.length} partidos pendientes en esta fecha`
                            }
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {isRecalculating && (
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: accentColor }} />
                                <span className="text-[9px] font-bold uppercase" style={{ color: accentColor }}>Calculando</span>
                            </div>
                        )}

                        <button
                            onClick={isSimulating ? pauseLive : startLive}
                            disabled={unplayedInRound.length === 0 && !isSimulating}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all disabled:opacity-30"
                            style={{
                                background: isSimulating ? 'rgba(239,68,68,0.15)' : `${accentColor}20`,
                                color: isSimulating ? '#EF4444' : accentColor,
                                border: `1px solid ${isSimulating ? 'rgba(239,68,68,0.3)' : `${accentColor}40`}`,
                            }}>
                            {isSimulating
                                ? <><Pause size={14} /> Pausar</>
                                : <><Play size={14} /> {allFinished ? 'Finalizado' : 'Iniciar'}</>
                            }
                        </button>
                    </div>
                </div>

                {/* Progress bar */}
                {(anyLive || allFinished) && (
                    <div className="mt-3 flex items-center gap-2">
                        <span className="text-[9px] font-bold" style={{ color: 'var(--text-faint)' }}>0'</span>
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
                            <div className="h-full rounded-full transition-all duration-300"
                                style={{
                                    width: `${progressPct}%`,
                                    background: allFinished ? 'var(--win)' : `linear-gradient(90deg, ${accentColor}, ${accentColor}80)`,
                                }} />
                        </div>
                        <span className="text-[9px] font-bold" style={{ color: 'var(--text-faint)' }}>90'</span>
                    </div>
                )}
            </div>

            {/* ─── Content ─── */}
            {liveMatches.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Left: Match Cards + Events */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Match cards grid */}
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 px-1 mb-3"
                                style={{ color: 'var(--text-faint)' }}>
                                <Activity size={12} /> {liveMatches.length} Partidos
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {liveMatches.map(lm => (
                                    <PartidoSimulado key={lm.matchId} lm={lm} teams={teams} accentColor={accentColor} />
                                ))}
                            </div>
                        </div>

                        {/* Events feed */}
                        <EventsFeed liveMatches={liveMatches} teams={teams} accentColor={accentColor} />
                    </div>

                    {/* Right: Probabilities */}
                    <div className="lg:col-span-1">
                        <ProbabilidadesDinamicas
                            projections={projections}
                            previousProjections={prevProjections}
                            isRecalculating={isRecalculating}
                            accentColor={accentColor}
                            hasLiveData={liveMatches.length > 0}
                        />
                    </div>
                </div>
            ) : (
                /* Empty state */
                <div className="card theme-fade p-12 text-center">
                    <Radio size={40} className="mx-auto mb-3 opacity-20" style={{ color: accentColor }} />
                    <p className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>
                        Presioná "Iniciar" para simular la Fecha {selectedRound} en tiempo real
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>
                        Los partidos se juegan minuto a minuto — las probabilidades se recalculan con cada gol via Web Worker
                    </p>
                </div>
            )}
        </div>
    );
};

