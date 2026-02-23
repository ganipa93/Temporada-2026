'use client';

import React, { useState, useMemo } from 'react';
import { useLiveFixtures, type Fixture } from '@/hooks/useLiveFixtures';
import { PartidoEnVivo } from '@/components/en-vivo/PartidoEnVivo';
import { PartidoFinalizado } from '@/components/en-vivo/PartidoFinalizado';
import { Tv, ChevronLeft, ChevronRight, RefreshCw, Wifi, WifiOff, Clock, Calendar } from 'lucide-react';

/* ─── Upcoming match card ─── */
const PartidoProximo: React.FC<{ fixture: Fixture }> = React.memo(({ fixture }) => {
    const { home, away, date, venue } = fixture;
    const matchDate = new Date(date);
    const timeStr = matchDate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
    const dateStr = matchDate.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });

    return (
        <div className="card theme-fade p-4 relative overflow-hidden"
            style={{ borderLeft: '3px solid var(--text-faint)' }}>
            <div className="absolute top-2.5 right-3">
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded"
                    style={{ background: 'var(--surface-2)', color: 'var(--text-faint)' }}>
                    PRÓXIMO
                </span>
            </div>
            <div className="flex items-center justify-between gap-3 mt-1">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <img src={home.logo} alt="" className="w-8 h-8 object-contain flex-shrink-0" />
                    <span className="text-xs font-bold truncate" style={{ color: 'var(--text)' }}>{home.name}</span>
                </div>
                <div className="flex flex-col items-center px-4">
                    <div className="flex items-center gap-1">
                        <Clock size={11} style={{ color: 'var(--text-faint)' }} />
                        <span className="text-sm font-black" style={{ color: 'var(--text-muted)' }}>{timeStr}</span>
                    </div>
                    <span className="text-[9px]" style={{ color: 'var(--text-faint)' }}>{dateStr}</span>
                </div>
                <div className="flex items-center gap-2.5 flex-1 min-w-0 justify-end">
                    <span className="text-xs font-bold truncate text-right" style={{ color: 'var(--text)' }}>{away.name}</span>
                    <img src={away.logo} alt="" className="w-8 h-8 object-contain flex-shrink-0" />
                </div>
            </div>
            {venue && (
                <p className="text-[8px] text-center mt-2 pt-1.5" style={{ color: 'var(--text-faint)', borderTop: '1px solid var(--border)' }}>
                    📍 {venue}
                </p>
            )}
        </div>
    );
});
PartidoProximo.displayName = 'PartidoProximo';

/* ─── Skeleton ─── */
const FixtureSkeleton: React.FC = () => (
    <div className="card animate-pulse p-4">
        <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1">
                <div className="w-8 h-8 rounded-full" style={{ background: 'var(--surface-2)' }} />
                <div className="h-3 w-20 rounded" style={{ background: 'var(--surface-2)' }} />
            </div>
            <div className="flex flex-col items-center gap-1 px-4">
                <div className="h-6 w-16 rounded" style={{ background: 'var(--surface-2)' }} />
            </div>
            <div className="flex items-center gap-2 flex-1 justify-end">
                <div className="h-3 w-20 rounded" style={{ background: 'var(--surface-2)' }} />
                <div className="w-8 h-8 rounded-full" style={{ background: 'var(--surface-2)' }} />
            </div>
        </div>
    </div>
);

/* ─── Section label ─── */
const SectionLabel: React.FC<{ label: string; count: number; icon: React.ReactNode; color: string }> = ({ label, count, icon, color }) => (
    <div className="flex items-center gap-2 px-1 mb-2 mt-4 first:mt-0">
        <span style={{ color }}>{icon}</span>
        <h4 className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>{label}</h4>
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${color}15`, color }}>{count}</span>
    </div>
);

/* ═══ PARTIDOS EN VIVO — TanStack Query version ═══ */
interface Props { accentColor?: string }

export const PartidosEnVivo: React.FC<Props> = ({ accentColor = '#4FC3F7' }) => {
    const [dateOffset, setDateOffset] = useState(0);

    const targetDate = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() + dateOffset);
        return d.toISOString().split('T')[0];
    }, [dateOffset]);

    // ← TanStack Query instead of manual polling
    const { data, isLoading, error, dataUpdatedAt, isFetching, refetch } = useLiveFixtures(targetDate);
    const fixtures = data?.fixtures ?? [];
    const isConnected = !error;

    const { live, finished, upcoming } = useMemo(() => ({
        live: fixtures.filter((f: Fixture) => f.status === 'live' || f.status === 'halftime'),
        finished: fixtures.filter((f: Fixture) => f.status === 'finished'),
        upcoming: fixtures.filter((f: Fixture) => f.status === 'upcoming'),
    }), [fixtures]);

    const dateLabel = useMemo(() => {
        if (dateOffset === 0) return 'Hoy';
        if (dateOffset === -1) return 'Ayer';
        if (dateOffset === 1) return 'Mañana';
        const d = new Date(); d.setDate(d.getDate() + dateOffset);
        return d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' });
    }, [dateOffset]);

    const lastUpdatedStr = dataUpdatedAt
        ? new Date(dataUpdatedAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        : '—';

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="card theme-fade p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Tv size={16} style={{ color: accentColor }} />
                            <h2 className="text-sm font-black uppercase tracking-widest" style={{ color: accentColor }}>
                                Partidos Reales
                            </h2>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                                {isConnected
                                    ? <Wifi size={11} style={{ color: 'var(--win)' }} />
                                    : <WifiOff size={11} style={{ color: 'var(--loss)' }} />}
                                <span className="text-[9px]" style={{ color: 'var(--text-faint)' }}>
                                    {isConnected ? 'Conectado' : 'Sin conexión'}
                                </span>
                            </div>
                            <span className="text-[9px]" style={{ color: 'var(--text-faint)' }}>
                                Última actualización: {lastUpdatedStr}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => refetch()}
                            className="p-2 rounded-lg transition-all hover:scale-105"
                            style={{ background: 'var(--surface-2)', color: 'var(--text-faint)' }}
                            title="Actualizar">
                            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
                        </button>
                        <div className="flex items-center gap-0.5 p-0.5 rounded-lg"
                            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                            <button onClick={() => setDateOffset(d => d - 1)}
                                className="p-1.5 rounded-md transition-colors hover:opacity-80"
                                style={{ color: 'var(--text-muted)' }}>
                                <ChevronLeft size={14} />
                            </button>
                            <button onClick={() => setDateOffset(0)}
                                className="px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 min-w-[90px] justify-center"
                                style={{
                                    background: dateOffset === 0 ? `${accentColor}20` : 'transparent',
                                    color: dateOffset === 0 ? accentColor : 'var(--text)',
                                }}>
                                <Calendar size={11} />{dateLabel}
                            </button>
                            <button onClick={() => setDateOffset(d => d + 1)}
                                className="p-1.5 rounded-md transition-colors hover:opacity-80"
                                style={{ color: 'var(--text-muted)' }}>
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="card theme-fade p-6 text-center">
                    <WifiOff size={32} className="mx-auto mb-2 opacity-30" style={{ color: 'var(--loss)' }} />
                    <p className="text-sm font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Error de conexión</p>
                    <p className="text-xs mb-3" style={{ color: 'var(--text-faint)' }}>{String(error)}</p>
                    <button onClick={() => refetch()}
                        className="px-4 py-1.5 rounded-lg text-xs font-bold"
                        style={{ background: `${accentColor}20`, color: accentColor, border: `1px solid ${accentColor}40` }}>
                        Reintentar
                    </button>
                </div>
            )}

            {/* Loading */}
            {isLoading && fixtures.length === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[0, 1, 2, 3].map(i => <FixtureSkeleton key={i} />)}
                </div>
            )}

            {/* Empty */}
            {!isLoading && !error && fixtures.length === 0 && (
                <div className="card theme-fade p-12 text-center">
                    <Tv size={40} className="mx-auto mb-3 opacity-20" style={{ color: accentColor }} />
                    <p className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>
                        No hay partidos para {dateLabel.toLowerCase()}
                    </p>
                </div>
            )}

            {/* Fixtures */}
            {fixtures.length > 0 && (
                <div>
                    {live.length > 0 && (
                        <>
                            <SectionLabel label="En Vivo" count={live.length}
                                icon={<span className="w-2 h-2 rounded-full inline-block animate-pulse" style={{ background: '#EF4444' }} />}
                                color="#EF4444" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                {live.map(f => <PartidoEnVivo key={f.id} fixture={f} accentColor={accentColor} />)}
                            </div>
                        </>
                    )}
                    {finished.length > 0 && (
                        <>
                            <SectionLabel label="Finalizados" count={finished.length}
                                icon={<span className="text-[10px]">🏁</span>} color="var(--win)" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                {finished.map(f => <PartidoFinalizado key={f.id} fixture={f} />)}
                            </div>
                        </>
                    )}
                    {upcoming.length > 0 && (
                        <>
                            <SectionLabel label="Próximos" count={upcoming.length}
                                icon={<Clock size={11} />} color="var(--text-faint)" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {upcoming.map(f => <PartidoProximo key={f.id} fixture={f} />)}
                            </div>
                        </>
                    )}
                </div>
            )}

            <p className="text-[9px] text-center pt-2" style={{ color: 'var(--text-faint)' }}>
                Datos via API-Football · TanStack Query · Actualización cada 15 seg
            </p>
        </div>
    );
};
