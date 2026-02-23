'use client';

import React, { useMemo } from 'react';
import type { Team } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

interface AnnualTableProps {
    teams: Team[];
}

export const AnnualTable: React.FC<AnnualTableProps> = ({ teams }) => {
    const tableData = useMemo(() =>
        [...teams].sort((a, b) =>
            b.stats.pts - a.stats.pts ||
            b.stats.goalDiff - a.stats.goalDiff ||
            b.stats.gf - a.stats.gf
        ),
        [teams]
    );

    const getZoneInfo = (index: number, total: number) => {
        if (index < 3) return { label: 'LIB', bg: 'rgba(251,191,36,0.07)', color: 'var(--gold)', badgeBg: 'rgba(217,119,6,0.8)' };
        if (index >= 3 && index < 9) return { label: 'SUD', bg: 'rgba(79,195,247,0.06)', color: 'var(--accent)', badgeBg: 'rgba(0,122,204,0.8)' };
        if (index >= total - 1) return { label: 'DESC', bg: 'rgba(239,68,68,0.07)', color: 'var(--loss)', badgeBg: 'rgba(220,38,38,0.9)' };
        return { label: null, bg: 'transparent', color: 'var(--text-faint)', badgeBg: '' };
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Info Banner */}
            <div className="card theme-fade mb-4 p-3">
                <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                    <strong style={{ color: 'var(--text)' }}>Tabla Anual 2026.</strong> Suma de puntos de los torneos Apertura y Clausura 2026.
                </p>
                <div className="flex flex-wrap gap-3 text-xs">
                    {[
                        { color: 'var(--gold)', label: 'Copa Libertadores 2027' },
                        { color: 'var(--accent)', label: 'Copa Sudamericana 2027' },
                        { color: 'var(--loss)', label: 'Descenso por Tabla Anual' },
                    ].map(({ color, label }) => (
                        <div key={label} className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color, opacity: 0.7 }} />
                            <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Table Card */}
            <div className="card theme-fade overflow-hidden">
                <div className="px-4 py-3"
                    style={{ background: 'linear-gradient(135deg, #1a2744 0%, #243566 100%)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    <h2 className="font-black text-white uppercase tracking-widest text-xs">Tabla Anual 2026</h2>
                    <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>Posición acumulada · Apertura + Clausura</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-center compact-table">
                        <thead style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                            <tr>
                                {[
                                    { h: '#', cls: 'w-10' },
                                    { h: 'Equipo', cls: 'text-left' },
                                    { h: 'Pts', cls: 'font-black' },
                                    { h: 'PJ', cls: '' },
                                    { h: 'PG', cls: '' },
                                    { h: 'PE', cls: '' },
                                    { h: 'PP', cls: '' },
                                    { h: 'GF', cls: 'hidden sm:table-cell' },
                                    { h: 'GC', cls: 'hidden sm:table-cell' },
                                    { h: 'DG', cls: '' },
                                ].map(col => (
                                    <th key={col.h} className={`px-3 py-2.5 text-xs font-bold uppercase ${col.cls}`}
                                        style={{ color: 'var(--text-faint)', letterSpacing: '0.06em' }}>
                                        {col.h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {tableData.map((team, index) => {
                                    const zone = getZoneInfo(index, tableData.length);
                                    const gd = team.stats.goalDiff;

                                    return (
                                        <motion.tr
                                            key={team.id}
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.02 }}
                                            style={{ background: zone.bg, borderBottom: '1px solid var(--border)' }}
                                            className="theme-fade"
                                        >
                                            {/* # */}
                                            <td className="px-3 py-2.5 font-bold text-center"
                                                style={{ color: zone.color }}>
                                                {index + 1}
                                            </td>

                                            {/* Equipo */}
                                            <td className="px-3 py-2.5 text-left">
                                                <div className="flex items-center gap-2">
                                                    <img src={team.logo} alt={team.name} className="w-5 h-5 object-contain flex-shrink-0" />
                                                    <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{team.name}</span>
                                                    {zone.label && (
                                                        <span className="text-[9px] px-1.5 py-0.5 rounded font-black uppercase text-white"
                                                            style={{ background: zone.badgeBg }}>
                                                            {zone.label}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Pts */}
                                            <td className="px-3 py-2.5 font-black text-base" style={{ color: 'var(--text)' }}>
                                                {team.stats.pts}
                                            </td>

                                            {/* PJ */}
                                            <td className="px-3 py-2.5" style={{ color: 'var(--text-muted)' }}>{team.stats.played}</td>

                                            {/* PG */}
                                            <td className="px-3 py-2.5 font-semibold" style={{ color: 'var(--win)' }}>{team.stats.won}</td>

                                            {/* PE */}
                                            <td className="px-3 py-2.5" style={{ color: 'var(--text-muted)' }}>{team.stats.drawn}</td>

                                            {/* PP */}
                                            <td className="px-3 py-2.5 font-semibold" style={{ color: 'var(--loss)' }}>{team.stats.lost}</td>

                                            {/* GF / GC */}
                                            <td className="px-3 py-2.5 hidden sm:table-cell" style={{ color: 'var(--text-faint)' }}>{team.stats.gf}</td>
                                            <td className="px-3 py-2.5 hidden sm:table-cell" style={{ color: 'var(--text-faint)' }}>{team.stats.gc}</td>

                                            {/* DG */}
                                            <td className="px-3 py-2.5 font-bold"
                                                style={{ color: gd > 0 ? 'var(--win)' : gd < 0 ? 'var(--loss)' : 'var(--text-faint)' }}>
                                                {gd > 0 ? `+${gd}` : gd}
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

