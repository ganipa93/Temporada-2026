import React, { useState, useMemo } from 'react';
import type { Match, Team } from '../types';
import { ChevronLeft, ChevronRight, Shield } from 'lucide-react';
import clsx from 'clsx';

interface MatchListProps {
    matches: Match[];
    teams: Team[];
    onUpdate?: (matchId: string, homeScore: number, awayScore: number) => void;
    onSimulate?: (matchId: string) => void;
    onSimulateRest?: () => void;
    theme?: 'blue' | 'purple';
}

export const MatchList: React.FC<MatchListProps> = ({ matches, teams, onUpdate, onSimulate, theme = 'blue' }) => {
    const [currentRound, setCurrentRound] = useState(1);
    const getTeam = (id: string) => teams.find(t => t.id === id);

    // Group matches by round to check existence
    const maxRound = useMemo(() => Math.max(...matches.map(m => m.round), 1), [matches]);

    const currentMatches = useMemo(() =>
        matches.filter(m => m.round === currentRound)
            .sort((a, b) => {
                // Sort by ID is usually safe for keeping initial order
                return parseInt(a.id) - parseInt(b.id);
            }),
        [matches, currentRound]);

    const nextRound = () => setCurrentRound(prev => Math.min(prev + 1, maxRound));
    const prevRound = () => setCurrentRound(prev => Math.max(prev - 1, 1));

    const t = theme === 'blue' ? {
        header: 'bg-blue-900',
        sub: 'bg-blue-900/80 text-blue-100/80',
        rowHover: 'hover:bg-blue-900/10',
        textHigh: 'text-blue-400',
        icon: 'text-blue-500',
        input: 'focus:border-blue-500/50',
        inputText: 'text-blue-400',
        btnText: 'text-blue-500 hover:text-blue-300',
        btnBg: 'bg-blue-500/20 border-blue-500/50'
    } : {
        header: 'bg-purple-900',
        sub: 'bg-purple-900/80 text-purple-100/80',
        rowHover: 'hover:bg-purple-900/10',
        textHigh: 'text-purple-400', // Fuchsia/Purple
        icon: 'text-purple-500',
        input: 'focus:border-purple-500/50',
        inputText: 'text-purple-400',
        btnText: 'text-purple-500 hover:text-purple-300',
        btnBg: 'bg-purple-500/20 border-purple-500/50'
    };

    return (
        <div className="bg-surface rounded-xl border border-white/10 overflow-hidden shadow-2xl max-w-3xl mx-auto">
            {/* Header */}
            <div className={`${t.header} p-4 flex items-center justify-between text-white border-b border-white/10`}>
                <button
                    onClick={prevRound}
                    disabled={currentRound === 1}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors disabled:opacity-30"
                >
                    <ChevronLeft size={24} />
                </button>
                <div className="text-center">
                    <h2 className="text-xl font-black uppercase tracking-wider">Fecha {currentRound}</h2>
                </div>
                <button
                    onClick={nextRound}
                    disabled={currentRound === maxRound}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors disabled:opacity-30"
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            {/* Date Subheader (Mock) */}
            <div className={`${t.sub} p-2 text-center text-sm font-medium border-b border-white/5`}>
                {matches[0]?.tournament === 'clausura' ? 'Torneo Clausura 2026' : 'Torneo Apertura 2026'}
            </div>

            {/* List */}
            <div className="divide-y divide-white/5 bg-[#0f172a]">
                {currentMatches.map(match => {
                    const home = getTeam(match.homeTeamId);
                    const away = getTeam(match.awayTeamId);

                    if (!home || !away) return null;

                    return (
                        <div key={match.id} className={`grid grid-cols-[60px_1fr_auto_1fr] md:grid-cols-[80px_1fr_auto_1fr] gap-2 md:gap-4 items-center p-3 ${t.rowHover} transition-colors group relative`}>
                            {/* Time */}
                            <div className={`text-center font-mono ${theme === 'blue' ? 'text-blue-400/80' : 'text-purple-400/80'} font-bold text-sm md:text-base`}>
                                11:00
                            </div>

                            {/* Home */}
                            <div className="flex items-center justify-end gap-3 text-right">
                                <span className={clsx("font-bold text-sm md:text-base leading-tight", match.homeScore && match.awayScore && match.homeScore > match.awayScore ? t.textHigh : "text-zinc-100")}>
                                    <span className="md:hidden">{home.shortName}</span>
                                    <span className="hidden md:inline">{home.name}</span>
                                </span>
                                <img src={home.logo} alt={home.name} className="w-8 h-8 object-contain shrink-0" />
                            </div>

                            {/* Score */}
                            <div className="flex items-center gap-1 min-w-[80px] justify-center relative">
                                <input
                                    type="number"
                                    min="0"
                                    className={clsx(
                                        `w-8 h-8 text-center bg-black/40 text-white font-bold rounded focus:outline-none focus:bg-white/10 transition-colors border border-transparent ${t.input}`,
                                        match.isPlayed ? t.textHigh : "text-zinc-500"
                                    )}
                                    value={match.homeScore ?? ''}
                                    onChange={(e) => onUpdate && onUpdate(match.id, parseInt(e.target.value) || 0, match.awayScore || 0)}
                                    placeholder="-"
                                />
                                <span className="text-zinc-600 font-bold">-</span>
                                <input
                                    type="number"
                                    min="0"
                                    className={clsx(
                                        `w-8 h-8 text-center bg-black/40 text-white font-bold rounded focus:outline-none focus:bg-white/10 transition-colors border border-transparent ${t.input}`,
                                        match.isPlayed ? t.textHigh : "text-zinc-500"
                                    )}
                                    value={match.awayScore ?? ''}
                                    onChange={(e) => onUpdate && onUpdate(match.id, match.homeScore || 0, parseInt(e.target.value) || 0)}
                                    placeholder="-"
                                />

                                {/* Quick Sim Button (Hover) */}
                                {!match.isPlayed && onSimulate && (
                                    <button
                                        onClick={() => onSimulate(match.id)}
                                        className={`absolute -right-8 opacity-0 group-hover:opacity-100 transition-opacity ${t.btnText}`}
                                        title="Simular Partido"
                                    >
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${t.btnBg}`}>
                                            ➜
                                        </div>
                                    </button>
                                )}
                            </div>

                            {/* Away */}
                            <div className="flex items-center justify-start gap-3 text-left">
                                <img src={away.logo} alt={away.name} className="w-8 h-8 object-contain shrink-0" />
                                <span className={clsx("font-bold text-sm md:text-base leading-tight", match.homeScore && match.awayScore && match.awayScore > match.homeScore ? t.textHigh : "text-zinc-100")}>
                                    <span className="md:hidden">{away.shortName}</span>
                                    <span className="hidden md:inline">{away.name}</span>
                                </span>
                            </div>
                        </div>
                    );
                })}
                {currentMatches.length === 0 && (
                    <div className="p-8 text-center text-zinc-500 italic">
                        No hay partidos en esta fecha.
                    </div>
                )}
            </div>
        </div>
    );
};
