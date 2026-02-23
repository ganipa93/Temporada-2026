'use client';

import React from 'react';
import type { Fixture } from '@/hooks/useLiveFixtures';
import { Clock } from 'lucide-react';

interface Props {
    fixture: Fixture;
    accentColor: string;
}

const STATUS_MAP: Record<string, string> = {
    '1H': '1er Tiempo',
    '2H': '2do Tiempo',
    'HT': 'Entretiempo',
    'ET': 'Tiempo Extra',
    'BT': 'Descanso',
    'P': 'Penales',
    'INT': 'Interrupción',
};

export const PartidoEnVivo: React.FC<Props> = React.memo(({ fixture, accentColor }) => {
    const { home, away, score, elapsed, statusShort, events } = fixture;
    const isHalftime = fixture.status === 'halftime';

    // Goal events for display
    const goals = events.filter(e => e.type === 'Goal');
    const homeGoals = goals.filter(e => e.teamId === home.id);
    const awayGoals = goals.filter(e => e.teamId === away.id);

    return (
        <div className="card theme-fade p-4 relative overflow-hidden transition-all hover:scale-[1.005]"
            style={{ borderLeft: `3px solid ${isHalftime ? '#FBBF24' : accentColor}` }}>

            {/* Live badge */}
            <div className="absolute top-2.5 right-3 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full animate-pulse"
                    style={{ background: isHalftime ? '#FBBF24' : '#EF4444' }} />
                <span className="text-[9px] font-black uppercase"
                    style={{ color: isHalftime ? '#FBBF24' : '#EF4444' }}>
                    {isHalftime ? 'ENTRETIEMPO' : 'EN VIVO'}
                </span>
            </div>

            {/* Teams + Score */}
            <div className="flex items-center justify-between gap-3 mt-1">
                {/* Home */}
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <img src={home.logo} alt="" className="w-8 h-8 object-contain flex-shrink-0" />
                    <div className="min-w-0">
                        <span className="text-xs font-bold truncate block" style={{ color: 'var(--text)' }}>
                            {home.name}
                        </span>
                        {/* Home goal scorers */}
                        {homeGoals.length > 0 && (
                            <div className="mt-0.5 space-y-0">
                                {homeGoals.map((g, i) => (
                                    <p key={i} className="text-[9px]" style={{ color: 'var(--text-faint)' }}>
                                        ⚽ {g.player} {g.time}'{g.extra ? `+${g.extra}` : ''}
                                    </p>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Score */}
                <div className="flex flex-col items-center px-4">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl font-black font-mono tabular-nums"
                            style={{ color: (score.home ?? 0) > (score.away ?? 0) ? accentColor : 'var(--text)' }}>
                            {score.home ?? 0}
                        </span>
                        <span className="text-sm font-bold" style={{ color: 'var(--text-faint)' }}>–</span>
                        <span className="text-2xl font-black font-mono tabular-nums"
                            style={{ color: (score.away ?? 0) > (score.home ?? 0) ? accentColor : 'var(--text)' }}>
                            {score.away ?? 0}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                        <Clock size={9} style={{ color: accentColor }} />
                        <span className="text-[9px] font-bold" style={{ color: accentColor }}>
                            {isHalftime ? 'HT' : `${elapsed ?? 0}'`}
                        </span>
                        <span className="text-[8px]" style={{ color: 'var(--text-faint)' }}>
                            {STATUS_MAP[statusShort] || ''}
                        </span>
                    </div>
                </div>

                {/* Away */}
                <div className="flex items-center gap-2.5 flex-1 min-w-0 justify-end">
                    <div className="min-w-0 text-right">
                        <span className="text-xs font-bold truncate block" style={{ color: 'var(--text)' }}>
                            {away.name}
                        </span>
                        {awayGoals.length > 0 && (
                            <div className="mt-0.5 space-y-0">
                                {awayGoals.map((g, i) => (
                                    <p key={i} className="text-[9px] text-right" style={{ color: 'var(--text-faint)' }}>
                                        {g.time}'{g.extra ? `+${g.extra}` : ''} {g.player} ⚽
                                    </p>
                                ))}
                            </div>
                        )}
                    </div>
                    <img src={away.logo} alt="" className="w-8 h-8 object-contain flex-shrink-0" />
                </div>
            </div>

            {/* Venue */}
            {fixture.venue && (
                <p className="text-[8px] text-center mt-2 pt-1.5" style={{ color: 'var(--text-faint)', borderTop: '1px solid var(--border)' }}>
                    📍 {fixture.venue}
                </p>
            )}
        </div>
    );
});

PartidoEnVivo.displayName = 'PartidoEnVivo';

