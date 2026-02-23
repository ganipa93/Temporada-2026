'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import type { Match } from '@/lib/types';
import { ChevronLeft, ChevronRight, Check, Clock } from 'lucide-react';

interface Props {
    matches: Match[];
    tournament: 'apertura' | 'clausura';
    selectedRound: number;
    onSelectRound: (round: number) => void;
    accentColor: string;
}

interface RoundInfo {
    round: number;
    total: number;
    played: number;
    pending: number;
    status: 'complete' | 'partial' | 'pending';
}

export const MenuFechas: React.FC<Props> = React.memo(({ matches, tournament, selectedRound, onSelectRound, accentColor }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const rounds: RoundInfo[] = useMemo(() => {
        const tourneyMatches = matches.filter(m => m.tournament === tournament);
        const roundMap = new Map<number, { total: number; played: number }>();

        tourneyMatches.forEach(m => {
            const existing = roundMap.get(m.round) || { total: 0, played: 0 };
            existing.total++;
            if (m.isPlayed) existing.played++;
            roundMap.set(m.round, existing);
        });

        return Array.from(roundMap.entries())
            .sort(([a], [b]) => a - b)
            .map(([round, { total, played }]) => ({
                round,
                total,
                played,
                pending: total - played,
                status: played === total ? 'complete' as const
                    : played > 0 ? 'partial' as const
                        : 'pending' as const,
            }));
    }, [matches, tournament]);

    // Auto-scroll to selected round
    useEffect(() => {
        const el = scrollRef.current?.querySelector(`[data-round="${selectedRound}"]`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }, [selectedRound]);

    const scroll = (dir: 'left' | 'right') => {
        scrollRef.current?.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
    };

    if (rounds.length === 0) return null;

    const completedCount = rounds.filter(r => r.status === 'complete').length;
    const progressPct = (completedCount / rounds.length) * 100;

    return (
        <div className="card theme-fade overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 flex items-center justify-between"
                style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2">
                    <h3 className="text-[10px] font-black uppercase tracking-widest"
                        style={{ color: 'var(--text-faint)' }}>
                        Seleccionar Fecha
                    </h3>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${accentColor}15`, color: accentColor }}>
                        {completedCount}/{rounds.length} completadas
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => scroll('left')}
                        className="p-1 rounded-md transition-colors hover:opacity-80"
                        style={{ color: 'var(--text-faint)' }}>
                        <ChevronLeft size={14} />
                    </button>
                    <button onClick={() => scroll('right')}
                        className="p-1 rounded-md transition-colors hover:opacity-80"
                        style={{ color: 'var(--text-faint)' }}>
                        <ChevronRight size={14} />
                    </button>
                </div>
            </div>

            {/* Progress bar */}
            <div className="h-0.5 w-full" style={{ background: 'var(--surface-2)' }}>
                <div className="h-full transition-all duration-500"
                    style={{ width: `${progressPct}%`, background: `linear-gradient(90deg, var(--win), ${accentColor})` }} />
            </div>

            {/* Scrollable pills */}
            <div ref={scrollRef}
                className="flex items-center gap-1.5 px-3 py-3 overflow-x-auto"
                style={{ scrollbarWidth: 'none' }}>
                {rounds.map(r => {
                    const isActive = r.round === selectedRound;
                    const statusColors = {
                        complete: 'var(--win)',
                        partial: '#FBBF24',
                        pending: 'var(--text-faint)',
                    };

                    return (
                        <button
                            key={r.round}
                            data-round={r.round}
                            onClick={() => onSelectRound(r.round)}
                            className="flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                            style={{
                                background: isActive ? `${accentColor}20` : 'transparent',
                                border: isActive ? `2px solid ${accentColor}` : '2px solid transparent',
                                color: isActive ? accentColor : 'var(--text-muted)',
                                minWidth: 56,
                            }}
                        >
                            {/* Round number */}
                            <span className="text-sm font-black">{r.round}</span>

                            {/* Status indicator */}
                            <div className="flex items-center gap-1">
                                {r.status === 'complete' ? (
                                    <Check size={9} style={{ color: statusColors.complete }} />
                                ) : r.status === 'partial' ? (
                                    <Clock size={9} style={{ color: statusColors.partial }} />
                                ) : (
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColors.pending }} />
                                )}
                                <span className="text-[8px] font-bold"
                                    style={{ color: statusColors[r.status] }}>
                                    {r.status === 'complete' ? 'OK' : `${r.pending}`}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
});

MenuFechas.displayName = 'MenuFechas';

