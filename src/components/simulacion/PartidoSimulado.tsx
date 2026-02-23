'use client';

import React from 'react';
import type { Team } from '@/lib/types';
import type { LiveMatch } from '@/hooks/useLiveSimulation';
import { Clock } from 'lucide-react';

interface Props {
    lm: LiveMatch;
    teams: Team[];
    accentColor: string;
}

const STATUS_LABELS: Record<string, string> = {
    upcoming: 'Próximo',
    kickoff: 'Inicio',
    first_half: '1er Tiempo',
    halftime: 'Entretiempo',
    second_half: '2do Tiempo',
    fulltime: 'Final',
};

export const PartidoSimulado: React.FC<Props> = React.memo(({ lm, teams, accentColor }) => {
    const home = teams.find(t => t.id === lm.homeTeamId);
    const away = teams.find(t => t.id === lm.awayTeamId);
    const isLive = lm.status === 'first_half' || lm.status === 'second_half';
    const finished = lm.status === 'fulltime';

    const recentEvents = lm.events
        .filter(e => e.type === 'goal' || e.type === 'red_card')
        .slice(-3);

    return (
        <div className="card theme-fade p-3.5 relative overflow-hidden transition-all hover:scale-[1.01]"
            style={{
                borderLeft: isLive ? `3px solid ${accentColor}`
                    : finished ? '3px solid var(--win)'
                        : '3px solid var(--border)',
            }}>

            {/* Live pulse */}
            {isLive && (
                <div className="absolute top-2 right-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#EF4444' }} />
                    <span className="text-[9px] font-black uppercase" style={{ color: '#EF4444' }}>
                        EN VIVO
                    </span>
                </div>
            )}

            {/* Finished badge */}
            {finished && (
                <div className="absolute top-2 right-2">
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(74,222,128,0.1)', color: 'var(--win)' }}>
                        FINAL
                    </span>
                </div>
            )}

            {/* Teams + Score */}
            <div className="flex items-center justify-between gap-3">
                {/* Home */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <img src={home?.logo || ''} alt="" className="w-7 h-7 object-contain flex-shrink-0" />
                    <span className="text-xs font-bold truncate" style={{ color: 'var(--text)' }}>
                        {home?.shortName || '?'}
                    </span>
                </div>

                {/* Score */}
                <div className="flex flex-col items-center px-3">
                    <div className="flex items-center gap-2.5">
                        <span className="text-2xl font-black font-mono tabular-nums"
                            style={{ color: lm.homeScore > lm.awayScore ? accentColor : 'var(--text)' }}>
                            {lm.homeScore}
                        </span>
                        <span className="text-sm font-bold" style={{ color: 'var(--text-faint)' }}>–</span>
                        <span className="text-2xl font-black font-mono tabular-nums"
                            style={{ color: lm.awayScore > lm.homeScore ? accentColor : 'var(--text)' }}>
                            {lm.awayScore}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                        {isLive && <Clock size={9} style={{ color: accentColor }} />}
                        <span className="text-[9px] font-bold"
                            style={{ color: isLive ? accentColor : 'var(--text-faint)' }}>
                            {isLive ? `${lm.minute}'` : STATUS_LABELS[lm.status] || ''}
                        </span>
                    </div>
                </div>

                {/* Away */}
                <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                    <span className="text-xs font-bold truncate text-right" style={{ color: 'var(--text)' }}>
                        {away?.shortName || '?'}
                    </span>
                    <img src={away?.logo || ''} alt="" className="w-7 h-7 object-contain flex-shrink-0" />
                </div>
            </div>

            {/* Recent events */}
            {recentEvents.length > 0 && (
                <div className="mt-2.5 pt-2 flex flex-wrap gap-1" style={{ borderTop: '1px solid var(--border)' }}>
                    {recentEvents.map((evt, i) => (
                        <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                            style={{
                                background: evt.type === 'goal' ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)',
                                color: evt.type === 'goal' ? 'var(--win)' : 'var(--loss)',
                                border: `1px solid ${evt.type === 'goal' ? 'rgba(74,222,128,0.2)' : 'rgba(239,68,68,0.2)'}`,
                            }}>
                            {evt.minute}' {evt.type === 'goal' ? '⚽' : '🟥'} {evt.playerName || ''}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
});

PartidoSimulado.displayName = 'PartidoSimulado';

