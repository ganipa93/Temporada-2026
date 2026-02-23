'use client';

import React, { memo, useMemo } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { TeamProjection } from '@/hooks/useMonteCarloSimulation';

interface Props {
    projections: TeamProjection[];
    accentColor: string;
}

const MiniBar: React.FC<{ value: number; max: number; color: string }> = ({ value, max, color }) => (
    <div className="relative h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-3)', width: '100%' }}>
        <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${Math.min((value / Math.max(max, 1)) * 100, 100)}%`, background: color }} />
    </div>
);

export const ProbabilidadClasificacion: React.FC<Props> = memo(({ projections, accentColor }) => {
    const sorted = useMemo(() =>
        [...projections].sort((a, b) => b.qualifyPct - a.qualifyPct),
        [projections]
    );

    const maxQual = Math.max(...sorted.map(t => t.qualifyPct), 1);

    // Top 5 for mini chart overview
    const top5 = sorted.slice(0, 8);

    const getColor = (pct: number) => {
        if (pct >= 80) return 'var(--win)';
        if (pct >= 50) return accentColor;
        if (pct >= 20) return 'var(--gold)';
        return 'var(--text-faint)';
    };

    return (
        <div className="space-y-4">
            {/* Mini stacked overview chart */}
            <div className="mb-4">
                <ResponsiveContainer width="100%" height={140}>
                    <BarChart data={top5} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                        <XAxis dataKey="shortName" axisLine={false} tickLine={false}
                            tick={{ fill: 'var(--text-faint)', fontSize: 9, fontWeight: 700 }} />
                        <Tooltip
                            content={({ active, payload }: any) => {
                                if (!active || !payload?.[0]) return null;
                                const d = payload[0].payload;
                                return (
                                    <div className="card theme-fade px-3 py-2 text-xs shadow-xl" style={{ border: '1px solid var(--border-strong)' }}>
                                        <span className="font-bold" style={{ color: 'var(--text)' }}>{d.name}</span>
                                        <div className="flex gap-3 mt-1">
                                            <span style={{ color: 'var(--win)' }}>Top 4: {d.top4Pct}%</span>
                                            <span style={{ color: accentColor }}>Clasif: {d.qualifyPct}%</span>
                                        </div>
                                    </div>
                                );
                            }}
                            cursor={false}
                        />
                        <Bar dataKey="qualifyPct" radius={[4, 4, 0, 0]} animationDuration={700}>
                            {top5.map(entry => (
                                <Cell key={entry.teamId} fill={getColor(entry.qualifyPct)} fillOpacity={0.8} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Full table */}
            <div className="overflow-x-auto">
                <table className="w-full text-xs">
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--border)' }}>
                            <th className="text-left px-2 py-2.5 font-black uppercase text-[10px] tracking-widest" style={{ color: 'var(--text-faint)' }}>#</th>
                            <th className="text-left px-2 py-2.5 font-black uppercase text-[10px] tracking-widest" style={{ color: 'var(--text-faint)' }}>Equipo</th>
                            <th className="text-center px-2 py-2.5 font-black uppercase text-[10px] tracking-widest" style={{ color: 'var(--text-faint)' }}>Z</th>
                            <th className="text-center px-2 py-2.5 font-black uppercase text-[10px] tracking-widest" style={{ color: 'var(--text-faint)' }}>Pts</th>
                            <th className="text-center px-2 py-2.5 font-black uppercase text-[10px] tracking-widest hidden sm:table-cell" style={{ color: 'var(--text-faint)' }}>Avg Pts</th>
                            <th className="px-2 py-2.5 font-black uppercase text-[10px] tracking-widest w-28 hidden md:table-cell" style={{ color: 'var(--text-faint)' }}>Progreso</th>
                            <th className="text-center px-2 py-2.5 font-black uppercase text-[10px] tracking-widest" style={{ color: 'var(--win)' }}>Top 4</th>
                            <th className="text-center px-2 py-2.5 font-black uppercase text-[10px] tracking-widest" style={{ color: accentColor }}>Clasif.</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.map((t, idx) => (
                            <tr key={t.teamId}
                                className="theme-fade"
                                style={{
                                    borderBottom: '1px solid var(--border)',
                                    background: t.qualifyPct >= 80 ? 'rgba(74,222,128,0.04)' :
                                        t.qualifyPct <= 10 ? 'rgba(239,68,68,0.03)' : 'transparent'
                                }}>
                                <td className="px-2 py-2.5 font-bold" style={{ color: 'var(--text-faint)' }}>{idx + 1}</td>
                                <td className="px-2 py-2.5">
                                    <div className="flex items-center gap-2">
                                        <img src={t.logo} alt="" className="w-4 h-4 object-contain flex-shrink-0" />
                                        <span className="font-bold" style={{ color: 'var(--text)' }}>{t.shortName}</span>
                                    </div>
                                </td>
                                <td className="text-center px-2 py-2.5 font-mono text-[10px]" style={{ color: 'var(--text-faint)' }}>{t.zone}</td>
                                <td className="text-center px-2 py-2.5 font-bold" style={{ color: 'var(--text)' }}>{t.currentPts}</td>
                                <td className="text-center px-2 py-2.5 hidden sm:table-cell" style={{ color: 'var(--text-muted)' }}>{t.avgPts}</td>
                                <td className="px-2 py-2.5 hidden md:table-cell">
                                    <MiniBar value={t.qualifyPct} max={maxQual} color={getColor(t.qualifyPct)} />
                                </td>
                                <td className="text-center px-2 py-2.5 font-bold"
                                    style={{ color: t.top4Pct >= 50 ? 'var(--win)' : 'var(--text-muted)' }}>
                                    {t.top4Pct}%
                                </td>
                                <td className="text-center px-2 py-2.5">
                                    <span className="font-black font-mono" style={{ color: getColor(t.qualifyPct) }}>
                                        {t.qualifyPct}%
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
});

ProbabilidadClasificacion.displayName = 'ProbabilidadClasificacion';

