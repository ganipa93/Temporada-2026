'use client';

import React, { memo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import type { TeamProjection } from '@/hooks/useMonteCarloSimulation';

interface Props {
    projections: TeamProjection[];
}

const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.[0]) return null;
    const d = payload[0].payload;
    return (
        <div className="card theme-fade px-3 py-2 text-xs shadow-xl"
            style={{ border: '1px solid var(--border-strong)' }}>
            <div className="flex items-center gap-2 mb-1">
                <img src={d.logo} alt="" className="w-4 h-4 object-contain" />
                <span className="font-bold" style={{ color: 'var(--text)' }}>{d.name}</span>
            </div>
            <div style={{ color: 'var(--loss)' }}>
                <span className="font-black">{d.bottom3Pct}%</span>
                <span className="ml-1 opacity-60">riesgo zona baja</span>
            </div>
            <div className="mt-0.5" style={{ color: 'var(--text-faint)' }}>
                Último: {d.lastPct}% · Avg Pos: {d.avgPos}
            </div>
        </div>
    );
};

export const ProbabilidadDescenso: React.FC<Props> = memo(({ projections }) => {
    const data = projections
        .filter(t => t.bottom3Pct > 0)
        .sort((a, b) => b.bottom3Pct - a.bottom3Pct)
        .slice(0, 12);

    if (data.length === 0) return (
        <p className="py-6 text-center text-sm" style={{ color: 'var(--text-faint)' }}>
            Sin riesgo detectado actualmente.
        </p>
    );

    const maxPct = Math.max(...data.map(d => d.bottom3Pct));

    return (
        <div>
            <ResponsiveContainer width="100%" height={Math.max(data.length * 40, 160)}>
                <BarChart data={data} layout="vertical" margin={{ top: 4, right: 50, left: 0, bottom: 4 }}>
                    <XAxis type="number" domain={[0, Math.ceil(maxPct * 1.15)]} hide />
                    <YAxis type="category" dataKey="shortName" width={75}
                        tick={{ fill: 'var(--text)', fontSize: 11, fontWeight: 700 }}
                        axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={false} />
                    <ReferenceLine x={50} stroke="var(--loss)" strokeDasharray="3 3" strokeOpacity={0.4} />
                    <Bar dataKey="bottom3Pct" radius={[0, 6, 6, 0]} animationDuration={800}
                        label={{ position: 'right', fill: '#EF4444', fontSize: 11, fontWeight: 900, formatter: (v: any) => `${v}%` }}>
                        {data.map((entry, i) => {
                            const intensity = Math.round(200 - (i / data.length) * 100);
                            return <Cell key={entry.teamId} fill={`rgb(239,(${68 + i * 5}),${68 + i * 8})`}
                                style={{ opacity: intensity / 200 }} />;
                        })}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {/* High risk badges */}
            {data.filter(d => d.bottom3Pct >= 40).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 px-2">
                    {data.filter(d => d.bottom3Pct >= 40).map(d => (
                        <span key={d.teamId} className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                            style={{ background: 'rgba(239,68,68,0.12)', color: 'var(--loss)', border: '1px solid rgba(239,68,68,0.2)' }}>
                            <img src={d.logo} alt="" className="w-3 h-3 object-contain" />
                            {d.shortName} — {d.bottom3Pct}%
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
});

ProbabilidadDescenso.displayName = 'ProbabilidadDescenso';

