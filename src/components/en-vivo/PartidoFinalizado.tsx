'use client';

import React from 'react';
import type { Fixture } from '@/hooks/useLiveFixtures';

interface Props {
    fixture: Fixture;
}

export const PartidoFinalizado: React.FC<Props> = React.memo(({ fixture }) => {
    const { home, away, score, events, date } = fixture;

    const goals = events.filter(e => e.type === 'Goal');
    const homeGoals = goals.filter(e => e.teamId === home.id);
    const awayGoals = goals.filter(e => e.teamId === away.id);

    const matchTime = new Date(date).toLocaleTimeString('es-AR', {
        hour: '2-digit', minute: '2-digit', hour12: false,
    });

    return (
        <div className="card theme-fade p-4 relative overflow-hidden"
            style={{ borderLeft: '3px solid var(--border)' }}>

            {/* FT badge */}
            <div className="absolute top-2.5 right-3">
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(74,222,128,0.1)', color: 'var(--win)', border: '1px solid rgba(74,222,128,0.2)' }}>
                    FINAL
                </span>
            </div>

            {/* Teams + Score */}
            <div className="flex items-center justify-between gap-3 mt-1">
                {/* Home */}
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <img src={home.logo} alt="" className="w-8 h-8 object-contain flex-shrink-0" />
                    <div className="min-w-0">
                        <span className="text-xs font-bold truncate block"
                            style={{ color: home.winner ? 'var(--text)' : 'var(--text-muted)' }}>
                            {home.name}
                        </span>
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
                            style={{ color: (score.home ?? 0) > (score.away ?? 0) ? 'var(--win)' : 'var(--text-muted)' }}>
                            {score.home ?? 0}
                        </span>
                        <span className="text-sm font-bold" style={{ color: 'var(--text-faint)' }}>–</span>
                        <span className="text-2xl font-black font-mono tabular-nums"
                            style={{ color: (score.away ?? 0) > (score.home ?? 0) ? 'var(--win)' : 'var(--text-muted)' }}>
                            {score.away ?? 0}
                        </span>
                    </div>
                    <span className="text-[9px] font-bold" style={{ color: 'var(--text-faint)' }}>
                        FT · {matchTime}
                    </span>
                    {score.halftime && (
                        <span className="text-[8px]" style={{ color: 'var(--text-faint)' }}>
                            HT: {score.halftime.home}–{score.halftime.away}
                        </span>
                    )}
                </div>

                {/* Away */}
                <div className="flex items-center gap-2.5 flex-1 min-w-0 justify-end">
                    <div className="min-w-0 text-right">
                        <span className="text-xs font-bold truncate block"
                            style={{ color: away.winner ? 'var(--text)' : 'var(--text-muted)' }}>
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
        </div>
    );
});

PartidoFinalizado.displayName = 'PartidoFinalizado';

