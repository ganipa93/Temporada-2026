'use client';

import React, { memo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { TeamProjection } from '@/hooks/useMonteCarloSimulation';

interface Props {
    projections: TeamProjection[];
    accentColor: string;
}

/* Custom tooltip */
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
            <div style={{ color: 'var(--accent)' }}>
                <span className="font-black">{d.championPct}%</span>
                <span className="ml-1 opacity-60">chance de campeón</span>
            </div>
            <div className="mt-0.5" style={{ color: 'var(--text-faint)' }}>
                Pts actuales: {d.currentPts} · Avg proj: {d.avgPts}
            </div>
        </div>
    );
};

export const ProbabilidadCampeon: React.FC<Props> = memo(({ projections, accentColor }) => {
    const data = projections
        .filter(t => t.championPct > 0)
        .sort((a, b) => b.championPct - a.championPct)
        .slice(0, 12);

    if (data.length === 0) return (
        <p className="py-6 text-center text-sm" style={{ color: 'var(--text-faint)' }}>
            Torneo ya finalizado o sin datos.
        </p>
    );

    const maxPct = Math.max(...data.map(d => d.championPct));

    return (
        <div>
            <ResponsiveContainer width="100%" height={Math.max(data.length * 40, 160)}>
                <BarChart data={data} layout="vertical" margin={{ top: 4, right: 50, left: 0, bottom: 4 }}>
                    <XAxis type="number" domain={[0, Math.ceil(maxPct * 1.15)]} hide />
                    <YAxis type="category" dataKey="shortName" width={75}
                        tick={{ fill: 'var(--text)', fontSize: 11, fontWeight: 700 }}
                        axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={false} />
                    <Bar dataKey="championPct" radius={[0, 6, 6, 0]} animationDuration={800}
                        label={{ position: 'right', fill: accentColor, fontSize: 11, fontWeight: 900, formatter: (v: any) => `${v}%` }}>
                        {data.map((entry, i) => (
                            <Cell key={entry.teamId}
                                fill={i === 0 ? accentColor : `${accentColor}${Math.round(80 - i * 5).toString(16).padStart(2, '0')}`} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {/* Extra context */}
            <div className="flex flex-wrap gap-4 mt-3 px-2 text-[10px]" style={{ color: 'var(--text-faint)' }}>
                {data.slice(0, 3).map(d => (
                    <div key={d.teamId} className="flex items-center gap-1.5">
                        <img src={d.logo} alt="" className="w-3.5 h-3.5 object-contain" />
                        <span className="font-bold" style={{ color: 'var(--text-muted)' }}>{d.shortName}</span>
                        <span>Avg: {d.avgPts} pts · Pos: {d.avgPos}</span>
                    </div>
                ))}
            </div>
        </div>
    );
});

ProbabilidadCampeon.displayName = 'ProbabilidadCampeon';

