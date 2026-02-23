'use client';

import React, { memo, useMemo } from 'react';
import type { TeamProjection } from '@/hooks/useMonteCarloSimulation';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props {
    currentProjections: TeamProjection[];
    previousProjections: TeamProjection[];
    accentColor: string;
}

interface DeltaRow {
    teamId: string;
    shortName: string;
    logo: string;
    zone: string;
    champDelta: number;
    qualifyDelta: number;
    relDelta: number;
    champNow: number;
    qualifyNow: number;
    relNow: number;
}

const DeltaBadge: React.FC<{ value: number; invert?: boolean }> = ({ value, invert }) => {
    const isPositive = invert ? value < 0 : value > 0;
    const isNegative = invert ? value > 0 : value < 0;
    const color = isPositive ? 'var(--win)' : isNegative ? 'var(--loss)' : 'var(--text-faint)';
    const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

    return (
        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold font-mono" style={{ color }}>
            <Icon size={10} />
            {value > 0 ? '+' : ''}{value.toFixed(1)}
        </span>
    );
};

export const ImpactoEnTiempoReal: React.FC<Props> = memo(({ currentProjections, previousProjections, accentColor }) => {
    const deltas: DeltaRow[] = useMemo(() => {
        if (previousProjections.length === 0) return [];

        const prevMap = new Map(previousProjections.map(p => [p.teamId, p]));

        return currentProjections
            .map(curr => {
                const prev = prevMap.get(curr.teamId);
                if (!prev) return null;
                return {
                    teamId: curr.teamId,
                    shortName: curr.shortName,
                    logo: curr.logo,
                    zone: curr.zone,
                    champDelta: curr.championPct - prev.championPct,
                    qualifyDelta: curr.qualifyPct - prev.qualifyPct,
                    relDelta: curr.bottom3Pct - prev.bottom3Pct,
                    champNow: curr.championPct,
                    qualifyNow: curr.qualifyPct,
                    relNow: curr.bottom3Pct,
                };
            })
            .filter((d): d is DeltaRow => d !== null)
            .filter(d => Math.abs(d.champDelta) >= 0.5 || Math.abs(d.qualifyDelta) >= 1 || Math.abs(d.relDelta) >= 1)
            .sort((a, b) => Math.abs(b.champDelta) + Math.abs(b.qualifyDelta) - Math.abs(a.champDelta) - Math.abs(a.qualifyDelta));
    }, [currentProjections, previousProjections]);

    if (deltas.length === 0) return (
        <div className="py-4 text-center text-xs" style={{ color: 'var(--text-faint)' }}>
            Esperando cambios significativos...
        </div>
    );

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-xs">
                <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                        <th className="text-left px-2 py-2 font-black uppercase text-[9px] tracking-widest" style={{ color: 'var(--text-faint)' }}>Equipo</th>
                        <th className="text-center px-2 py-2 font-black uppercase text-[9px]" style={{ color: accentColor }}>Campeón</th>
                        <th className="text-center px-2 py-2 font-black uppercase text-[9px]" style={{ color: 'var(--win)' }}>Clasif.</th>
                        <th className="text-center px-2 py-2 font-black uppercase text-[9px]" style={{ color: 'var(--loss)' }}>Descenso</th>
                    </tr>
                </thead>
                <tbody>
                    {deltas.map(d => (
                        <tr key={d.teamId} className="theme-fade" style={{ borderBottom: '1px solid var(--border)' }}>
                            <td className="px-2 py-2">
                                <div className="flex items-center gap-2">
                                    <img src={d.logo} alt="" className="w-4 h-4 object-contain" />
                                    <span className="font-bold" style={{ color: 'var(--text)' }}>{d.shortName}</span>
                                    <span className="text-[8px] opacity-40">{d.zone}</span>
                                </div>
                            </td>
                            <td className="text-center px-2 py-2">
                                <div className="flex flex-col items-center">
                                    <span className="font-bold font-mono" style={{ color: accentColor }}>{d.champNow}%</span>
                                    <DeltaBadge value={d.champDelta} />
                                </div>
                            </td>
                            <td className="text-center px-2 py-2">
                                <div className="flex flex-col items-center">
                                    <span className="font-bold font-mono" style={{ color: 'var(--text-muted)' }}>{d.qualifyNow}%</span>
                                    <DeltaBadge value={d.qualifyDelta} />
                                </div>
                            </td>
                            <td className="text-center px-2 py-2">
                                <div className="flex flex-col items-center">
                                    <span className="font-bold font-mono" style={{ color: 'var(--text-muted)' }}>{d.relNow}%</span>
                                    <DeltaBadge value={d.relDelta} invert />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
});

ImpactoEnTiempoReal.displayName = 'ImpactoEnTiempoReal';

