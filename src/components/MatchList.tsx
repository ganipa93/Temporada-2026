'use client';

import React, { useState, useMemo } from 'react';
import type { Match, Team } from '@/lib/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

interface MatchListProps {
    matches: Match[];
    teams: Team[];
    onUpdate?: (matchId: string, homeScore: number, awayScore: number) => void;
    onSimulate?: (matchId: string) => void;
    onSimulateRest?: () => void;
    initialRound?: number;
    onRoundChange?: (round: number) => void;
    theme?: 'blue' | 'purple';
}

export const MatchList: React.FC<MatchListProps> = ({
    matches, teams, onUpdate, onSimulate, theme = 'blue', initialRound = 1, onRoundChange
}) => {
    const [viewRound, setViewRound] = useState(initialRound);

    React.useEffect(() => {
        setViewRound(initialRound);
    }, [initialRound]);

    const getTeam = (id: string) => teams.find(t => t.id === id);
    const maxRound = useMemo(() => Math.max(...matches.map(m => m.round), 1), [matches]);
    const currentMatches = useMemo(() =>
        matches.filter(m => m.round === viewRound).sort((a, b) => parseInt(a.id) - parseInt(b.id)),
        [matches, viewRound]
    );

    const nextRound = () => { const nr = Math.min(viewRound + 1, maxRound); setViewRound(nr); onRoundChange?.(nr); };
    const prevRound = () => { const pr = Math.max(viewRound - 1, 1); setViewRound(pr); onRoundChange?.(pr); };

    const isBlue = theme === 'blue';
    const accentHex = isBlue ? '#4FC3F7' : '#C084FC';
    const headerGradient = isBlue
        ? 'linear-gradient(135deg, #0D2240 0%, #1C3A5C 100%)'
        : 'linear-gradient(135deg, #2D1458 0%, #3B1873 100%)';

    const winnerStyle = { color: accentHex, fontWeight: 800 };
    const normalStyle = { color: 'var(--text)' };

    return (
        <div className="card theme-fade overflow-hidden max-w-3xl mx-auto">
            {/* Header */}
            <div style={{ background: headerGradient, borderBottom: '1px solid rgba(255,255,255,0.07)' }}
                className="px-4 py-3 flex items-center justify-between">
                <button
                    onClick={prevRound}
                    disabled={viewRound === 1}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-20"
                    style={{ color: 'white' }}
                >
                    <ChevronLeft size={20} />
                </button>

                <div className="text-center">
                    <p className="text-[10px] uppercase tracking-widest font-semibold opacity-50 text-white">
                        {matches[0]?.tournament === 'clausura' ? 'Clausura 2026' : 'Apertura 2026'}
                    </p>
                    <h2 className="text-lg font-black text-white tracking-wide">Fecha {viewRound}</h2>
                </div>

                <button
                    onClick={nextRound}
                    disabled={viewRound === maxRound}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-20"
                    style={{ color: 'white' }}
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Match List */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={viewRound}
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.18 }}
                >
                    {currentMatches.map((match, idx) => {
                        const home = getTeam(match.homeTeamId);
                        const away = getTeam(match.awayTeamId);
                        if (!home || !away) return null;

                        const homeWon = match.isPlayed && match.homeScore! > match.awayScore!;
                        const awayWon = match.isPlayed && match.awayScore! > match.homeScore!;

                        return (
                            <div
                                key={match.id}
                                className="group relative"
                                style={{
                                    borderBottom: idx < currentMatches.length - 1 ? '1px solid var(--border)' : 'none',
                                    background: match.isPlayed ? 'var(--surface)' : 'var(--surface-2)'
                                }}
                            >
                                <div className="grid items-center gap-2 px-3 py-2.5 md:px-4 md:py-3"
                                    style={{ gridTemplateColumns: '64px 1fr auto 1fr' }}>

                                    {/* Time / Status */}
                                    <div className="text-center">
                                        {match.isPlayed ? (
                                            <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
                                                style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                                                Final
                                            </span>
                                        ) : (
                                            <span className="text-xs font-mono font-bold" style={{ color: 'var(--text-faint)' }}>11:00</span>
                                        )}
                                    </div>

                                    {/* Home */}
                                    <div className="flex items-center justify-end gap-2 text-right min-w-0">
                                        <span className="font-semibold text-xs md:text-sm leading-tight truncate"
                                            style={homeWon ? winnerStyle : normalStyle}>
                                            <span className="md:hidden">{home.shortName}</span>
                                            <span className="hidden md:inline">{home.name}</span>
                                        </span>
                                        <img src={home.logo} alt={home.shortName} className="w-7 h-7 md:w-8 md:h-8 object-contain flex-shrink-0" />
                                    </div>

                                    {/* Score */}
                                    <div className="flex items-center gap-1 min-w-[72px] justify-center">
                                        <input
                                            type="number" min="0"
                                            className={clsx(
                                                'w-8 h-8 text-center font-bold rounded-lg text-sm border outline-none transition-all theme-fade',
                                                match.isPlayed ? 'font-black' : ''
                                            )}
                                            style={{
                                                background: 'var(--surface-3)',
                                                borderColor: match.isPlayed ? 'var(--border-strong)' : 'var(--border)',
                                                color: match.isPlayed ? 'var(--accent)' : 'var(--text-faint)',
                                            }}
                                            value={match.homeScore ?? ''}
                                            onChange={(e) => onUpdate?.(match.id, parseInt(e.target.value) || 0, match.awayScore || 0)}
                                            placeholder="-"
                                        />
                                        <span className="text-xs font-bold" style={{ color: 'var(--text-faint)' }}>:</span>
                                        <input
                                            type="number" min="0"
                                            className={clsx(
                                                'w-8 h-8 text-center font-bold rounded-lg text-sm border outline-none transition-all theme-fade',
                                                match.isPlayed ? 'font-black' : ''
                                            )}
                                            style={{
                                                background: 'var(--surface-3)',
                                                borderColor: match.isPlayed ? 'var(--border-strong)' : 'var(--border)',
                                                color: match.isPlayed ? 'var(--accent)' : 'var(--text-faint)',
                                            }}
                                            value={match.awayScore ?? ''}
                                            onChange={(e) => onUpdate?.(match.id, match.homeScore || 0, parseInt(e.target.value) || 0)}
                                            placeholder="-"
                                        />
                                        {/* Quick sim button */}
                                        {!match.isPlayed && onSimulate && (
                                            <button
                                                onClick={() => onSimulate(match.id)}
                                                title="Simular"
                                                className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold px-2 py-1 rounded-md"
                                                style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
                                            >
                                                ▶
                                            </button>
                                        )}
                                    </div>

                                    {/* Away */}
                                    <div className="flex items-center justify-start gap-2 text-left min-w-0">
                                        <img src={away.logo} alt={away.shortName} className="w-7 h-7 md:w-8 md:h-8 object-contain flex-shrink-0" />
                                        <span className="font-semibold text-xs md:text-sm leading-tight truncate"
                                            style={awayWon ? winnerStyle : normalStyle}>
                                            <span className="md:hidden">{away.shortName}</span>
                                            <span className="hidden md:inline">{away.name}</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {currentMatches.length === 0 && (
                        <div className="py-12 text-center" style={{ color: 'var(--text-faint)' }}>
                            No hay partidos en esta fecha.
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

