'use client';

import React, { useState, useMemo, lazy, Suspense } from 'react';
import type { Team, Match } from '@/lib/types';
import { useMonteCarloSimulation } from '@/hooks/useMonteCarloSimulation';
import { TrendingUp, Shield, AlertTriangle, BarChart3 } from 'lucide-react';

/* ── Lazy-loaded heavy chart sub-components ── */
const ProbabilidadCampeon = lazy(() =>
    import('./ProbabilidadCampeon').then(m => ({ default: m.ProbabilidadCampeon }))
);
const ProbabilidadClasificacion = lazy(() =>
    import('./ProbabilidadClasificacion').then(m => ({ default: m.ProbabilidadClasificacion }))
);
const ProbabilidadDescenso = lazy(() =>
    import('./ProbabilidadDescenso').then(m => ({ default: m.ProbabilidadDescenso }))
);
const DistribucionPosiciones = lazy(() =>
    import('./DistribucionPosiciones').then(m => ({ default: m.DistribucionPosiciones }))
);

/* ── Loading Skeleton ── */
const Skeleton: React.FC<{ height?: number }> = ({ height = 200 }) => (
    <div className="animate-pulse space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg" style={{
                background: 'var(--surface-2)',
                height: i === 0 ? height * 0.45 : height * 0.15,
                opacity: 1 - i * 0.15,
            }} />
        ))}
    </div>
);

/* ── Section Card ── */
const Section: React.FC<{
    title: string; subtitle?: string; icon: React.ReactNode; accent: string; children: React.ReactNode;
}> = ({ title, subtitle, icon, accent, children }) => (
    <div className="card theme-fade overflow-hidden">
        <div className="px-5 py-3.5 flex items-center gap-3"
            style={{
                background: 'linear-gradient(135deg, var(--surface-2) 0%, var(--surface) 100%)',
                borderBottom: '1px solid var(--border)',
            }}>
            <span className="p-1.5 rounded-lg" style={{ background: `${accent}18`, color: accent }}>{icon}</span>
            <div>
                <h3 className="text-xs font-black uppercase tracking-widest leading-none" style={{ color: 'var(--text)' }}>{title}</h3>
                {subtitle && <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-faint)' }}>{subtitle}</p>}
            </div>
        </div>
        <div className="p-5">
            <Suspense fallback={<Skeleton />}>
                {children}
            </Suspense>
        </div>
    </div>
);

/* ═══════════════════════════════════════════
   MAIN ORCHESTRATOR
   ═══════════════════════════════════════════ */

interface Props {
    teams: Team[];
    matches: Match[];
    tournament: 'apertura' | 'clausura';
}

export const ProbabilityPanel: React.FC<Props> = ({ teams, matches, tournament }) => {
    const projections = useMonteCarloSimulation(teams, matches, tournament);
    const [selectedZone, setSelectedZone] = useState<'all' | 'A' | 'B'>('all');

    const accentColor = tournament === 'clausura' ? '#C084FC' : '#4FC3F7';

    const filtered = useMemo(() =>
        selectedZone === 'all' ? projections : projections.filter(p => p.zone === selectedZone),
        [projections, selectedZone]
    );

    const unplayedCount = matches.filter(m => m.tournament === tournament && !m.isPlayed).length;
    const totalMatches = matches.filter(m => m.tournament === tournament).length;
    const playedPct = totalMatches > 0 ? Math.round(((totalMatches - unplayedCount) / totalMatches) * 100) : 0;

    if (projections.length === 0) return (
        <div className="card theme-fade p-16 text-center" style={{ color: 'var(--text-muted)' }}>
            <BarChart3 size={48} className="mx-auto mb-3 opacity-20" />
            <p className="font-bold text-sm">No hay datos suficientes para generar proyecciones.</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>Simulá al menos una fecha para ver las probabilidades.</p>
        </div>
    );

    return (
        <div className="space-y-5">
            {/* ─── Header Card ─── */}
            <div className="card theme-fade p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <BarChart3 size={18} style={{ color: accentColor }} />
                            <h2 className="text-sm font-black uppercase tracking-widest" style={{ color: accentColor }}>
                                Proyecciones — {tournament} 2026
                            </h2>
                        </div>
                        <p className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
                            Basado en <strong style={{ color: 'var(--text-muted)' }}>1.000 simulaciones Monte Carlo</strong> · {unplayedCount} partidos restantes
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Progress indicator */}
                        <div className="hidden sm:flex items-center gap-2">
                            <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
                                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${playedPct}%`, background: accentColor }} />
                            </div>
                            <span className="text-[10px] font-bold" style={{ color: 'var(--text-faint)' }}>{playedPct}%</span>
                        </div>

                        {/* Zone filter */}
                        <div className="flex p-0.5 rounded-lg gap-0.5" style={{ background: 'var(--surface-2)' }}>
                            {(['all', 'A', 'B'] as const).map(z => (
                                <button key={z} onClick={() => setSelectedZone(z)}
                                    className="px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all"
                                    style={selectedZone === z
                                        ? { background: accentColor, color: '#0A1A2F', boxShadow: `0 2px 8px ${accentColor}40` }
                                        : { color: 'var(--text-muted)' }
                                    }>
                                    {z === 'all' ? 'Todas' : `Zona ${z}`}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Charts Grid ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Champion */}
                <Section
                    title="Probabilidad de Campeón"
                    subtitle="Chance de terminar 1º en la zona"
                    icon={<TrendingUp size={16} />}
                    accent={accentColor}
                >
                    <ProbabilidadCampeon projections={filtered} accentColor={accentColor} />
                </Section>

                {/* Relegation */}
                <Section
                    title="Riesgo de Zona Baja"
                    subtitle="Chance de terminar en los últimos 3"
                    icon={<AlertTriangle size={16} />}
                    accent="#EF4444"
                >
                    <ProbabilidadDescenso projections={filtered} />
                </Section>
            </div>

            {/* Qualification — full width */}
            <Section
                title="Chances de Clasificación"
                subtitle="Top 8 → Playoffs · Top 4 → Mejor cabeza de serie"
                icon={<Shield size={16} />}
                accent="#4ADE80"
            >
                <ProbabilidadClasificacion projections={filtered} accentColor={accentColor} />
            </Section>

            {/* Heatmap — full width */}
            <Section
                title="Distribución de Posiciones"
                subtitle="% de probabilidad de terminar en cada posición — mayor intensidad = más probable"
                icon={<BarChart3 size={16} />}
                accent={accentColor}
            >
                <DistribucionPosiciones projections={filtered} accentColor={accentColor} />
            </Section>
        </div>
    );
};

