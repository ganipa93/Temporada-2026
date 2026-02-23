'use client';

import React, { lazy, Suspense, memo } from 'react';
import type { TeamProjection } from '@/hooks/useMonteCarloSimulation';
import { ImpactoEnTiempoReal } from '@/components/simulacion/ImpactoEnTiempoReal';
import { TrendingUp, AlertTriangle, BarChart3, Zap } from 'lucide-react';

/* Lazy-load Recharts-heavy components */
const ProbabilidadCampeon = lazy(() =>
    import('@/components/ProbabilidadCampeon').then(m => ({ default: m.ProbabilidadCampeon }))
);
const ProbabilidadDescenso = lazy(() =>
    import('@/components/ProbabilidadDescenso').then(m => ({ default: m.ProbabilidadDescenso }))
);

/* Skeleton placeholder */
const Skeleton: React.FC<{ h?: number }> = ({ h = 140 }) => (
    <div className="animate-pulse rounded-lg" style={{ height: h, background: 'var(--surface-2)' }} />
);

/* Section wrapper */
const Section: React.FC<{
    title: string; icon: React.ReactNode; accent: string;
    badge?: React.ReactNode; children: React.ReactNode;
}> = ({ title, icon, accent, badge, children }) => (
    <div className="card theme-fade overflow-hidden">
        <div className="px-4 py-2.5 flex items-center justify-between"
            style={{ borderBottom: '1px solid var(--border)', background: 'linear-gradient(135deg, var(--surface-2) 0%, var(--surface) 100%)' }}>
            <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg" style={{ background: `${accent}15`, color: accent }}>{icon}</span>
                <h4 className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text)' }}>{title}</h4>
            </div>
            {badge}
        </div>
        <div className="p-3">
            <Suspense fallback={<Skeleton />}>{children}</Suspense>
        </div>
    </div>
);

interface Props {
    projections: TeamProjection[];
    previousProjections: TeamProjection[];
    isRecalculating: boolean;
    accentColor: string;
    hasLiveData: boolean;
}

export const ProbabilidadesDinamicas: React.FC<Props> = memo(({
    projections, previousProjections, isRecalculating, accentColor, hasLiveData,
}) => {
    if (!hasLiveData || projections.length === 0) {
        return (
            <div className="card theme-fade p-8 text-center">
                <BarChart3 size={32} className="mx-auto mb-2 opacity-20" style={{ color: accentColor }} />
                <p className="text-[11px] font-bold" style={{ color: 'var(--text-faint)' }}>
                    Las probabilidades se actualizarán cuando inicie la simulación
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Impact table */}
            <Section title="Impacto en Tiempo Real" icon={<Zap size={14} />} accent={accentColor}
                badge={isRecalculating ? (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse"
                        style={{ background: `${accentColor}15`, color: accentColor }}>
                        Recalculando...
                    </span>
                ) : undefined}>
                <ImpactoEnTiempoReal
                    currentProjections={projections}
                    previousProjections={previousProjections}
                    accentColor={accentColor}
                />
            </Section>

            {/* Champion chart */}
            <Section title="Campeón — En Vivo" icon={<TrendingUp size={14} />} accent={accentColor}>
                <ProbabilidadCampeon projections={projections} accentColor={accentColor} />
            </Section>

            {/* Relegation chart */}
            <Section title="Riesgo Descenso — En Vivo" icon={<AlertTriangle size={14} />} accent="#EF4444">
                <ProbabilidadDescenso projections={projections} />
            </Section>
        </div>
    );
});

ProbabilidadesDinamicas.displayName = 'ProbabilidadesDinamicas';

