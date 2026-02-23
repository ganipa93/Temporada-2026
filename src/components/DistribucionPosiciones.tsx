'use client';

import React, { memo, useState, useMemo } from 'react';
import type { TeamProjection } from '@/hooks/useMonteCarloSimulation';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
    projections: TeamProjection[];
    accentColor: string;
}

/* Heatmap cell color engine */
const heatCell = (pct: number, accent: string): { bg: string; text: string } => {
    if (pct >= 40) return { bg: accent, text: '#0A1A2F' };
    if (pct >= 25) return { bg: `${accent}B3`, text: '#FFF' };
    if (pct >= 15) return { bg: `${accent}80`, text: '#FFF' };
    if (pct >= 8) return { bg: `${accent}40`, text: 'var(--text)' };
    if (pct >= 3) return { bg: `${accent}20`, text: 'var(--text-muted)' };
    if (pct > 0) return { bg: `${accent}0D`, text: 'var(--text-faint)' };
    return { bg: 'transparent', text: 'var(--text-faint)' };
};

export const DistribucionPosiciones: React.FC<Props> = memo(({ projections, accentColor }) => {
    const [expanded, setExpanded] = useState(false);

    const sorted = useMemo(() =>
        [...projections].sort((a, b) => a.avgPos - b.avgPos),
        [projections]
    );

    const posCount = sorted[0]?.positionDist.length || 0;
    const displayed = expanded ? sorted : sorted.slice(0, 10);

    return (
        <div>
            {/* Legend */}
            <div className="flex items-center gap-3 mb-3 px-1">
                <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
                    Intensidad:
                </span>
                {[3, 8, 15, 25, 40].map(v => {
                    const c = heatCell(v, accentColor);
                    return (
                        <div key={v} className="flex items-center gap-1">
                            <div className="w-4 h-3 rounded-sm" style={{ background: c.bg }} />
                            <span className="text-[8px]" style={{ color: 'var(--text-faint)' }}>{v}%</span>
                        </div>
                    );
                })}
            </div>

            {/* Grid */}
            <div className="overflow-x-auto -mx-4 px-4">
                <table className="w-full text-[10px] border-collapse" style={{ minWidth: posCount * 36 + 120 }}>
                    <thead>
                        <tr>
                            <th className="text-left px-2 py-2 font-black uppercase tracking-widest sticky left-0 z-10"
                                style={{ background: 'var(--surface)', color: 'var(--text-faint)' }}>
                                Equipo
                            </th>
                            {Array.from({ length: posCount }).map((_, i) => (
                                <th key={i} className="text-center px-0.5 py-2 font-black"
                                    style={{
                                        color: i === 0 ? 'var(--gold)' : i < 4 ? 'var(--win)' : i < 8 ? accentColor : 'var(--text-faint)',
                                    }}>
                                    {i + 1}º
                                </th>
                            ))}
                            <th className="text-center px-2 py-2 font-black" style={{ color: accentColor }}>
                                Avg
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayed.map(t => (
                            <tr key={t.teamId} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td className="px-2 py-1.5 sticky left-0 z-10"
                                    style={{ background: 'var(--surface)' }}>
                                    <div className="flex items-center gap-1.5 min-w-[90px]">
                                        <img src={t.logo} alt="" className="w-4 h-4 object-contain flex-shrink-0" />
                                        <span className="font-bold truncate" style={{ color: 'var(--text)' }}>{t.shortName}</span>
                                        <span className="text-[8px] opacity-40 ml-0.5">{t.zone}</span>
                                    </div>
                                </td>
                                {t.positionDist.map((pct, i) => {
                                    const c = heatCell(pct, accentColor);
                                    return (
                                        <td key={i} className="text-center px-0.5 py-1">
                                            <div className="rounded font-mono font-bold py-0.5 mx-auto transition-all duration-300"
                                                style={{
                                                    background: c.bg,
                                                    color: c.text,
                                                    opacity: pct === 0 ? 0.2 : 1,
                                                    width: 30,
                                                }}>
                                                {pct > 0 ? pct : '–'}
                                            </div>
                                        </td>
                                    );
                                })}
                                <td className="text-center px-2 py-1.5 font-black font-mono"
                                    style={{ color: accentColor }}>
                                    {t.avgPos}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Expand toggle */}
            {sorted.length > 10 && (
                <button
                    onClick={() => setExpanded(v => !v)}
                    className="mt-3 flex items-center gap-1 mx-auto text-[11px] font-bold transition-colors"
                    style={{ color: accentColor }}
                >
                    {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    {expanded ? 'Mostrar menos' : `Ver los ${sorted.length} equipos`}
                </button>
            )}
        </div>
    );
});

DistribucionPosiciones.displayName = 'DistribucionPosiciones';

