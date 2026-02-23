'use client';

import React from 'react';
import type { Team } from '@/lib/types';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

interface StandingsTableProps {
    zoneName: string;
    teams: Team[];
    theme?: 'blue' | 'purple';
}

export const StandingsTable: React.FC<StandingsTableProps> = ({ zoneName, teams, theme = 'blue' }) => {
    const isBlue = theme === 'blue';

    // Accent colours from design system (reflect CSS vars in JS for gradients)
    const accentHex = isBlue ? '#4FC3F7' : '#C084FC';
    const headerGradient = isBlue
        ? 'linear-gradient(135deg, #0D2240 0%, #1C3A5C 100%)'
        : 'linear-gradient(135deg, #2D1458 0%, #3B1873 100%)';

    const getZoneStyle = (index: number, total: number) => {
        if (index < 3) return 'perf-top';
        if (index >= total - 3) return 'perf-bottom';
        return 'perf-mid';
    };

    const renderFormBadge = (res: string, i: number) => {
        const labels: Record<string, string> = { W: 'V', D: 'E', L: 'D' };
        return (
            <motion.span
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.06 }}
                className={clsx(
                    'inline-flex items-center justify-center w-4 h-4 md:w-5 md:h-5 rounded-full',
                    'text-[8px] md:text-[10px] font-black text-white badge-' + res
                )}
            >
                {labels[res] ?? res}
            </motion.span>
        );
    };

    return (
        <div className="card theme-fade overflow-hidden">
            {/* Zone Header */}
            <div
                className="px-4 py-3 flex items-center justify-between"
                style={{ background: headerGradient, borderBottom: `1px solid rgba(255,255,255,0.07)` }}
            >
                <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: accentHex }} />
                    <h3 className="font-bold text-white text-base md:text-lg tracking-tight">{zoneName}</h3>
                </div>
                <span className="text-xs font-semibold uppercase tracking-widest hidden sm:block"
                    style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Liga Profesional
                </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left compact-table">
                    <thead>
                        <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                            {[
                                { label: '#', cls: 'w-10 text-center' },
                                { label: 'Equipo', cls: '' },
                                { label: 'Pts', cls: 'text-center w-12', title: 'Puntos' },
                                { label: 'PJ', cls: 'text-center w-10 hidden sm:table-cell', title: 'Jugados' },
                                { label: 'G', cls: 'text-center w-10 hidden md:table-cell', title: 'Ganados' },
                                { label: 'E', cls: 'text-center w-10 hidden md:table-cell', title: 'Empatados' },
                                { label: 'P', cls: 'text-center w-10 hidden md:table-cell', title: 'Perdidos' },
                                { label: 'DG', cls: 'text-center w-12 hidden sm:table-cell', title: 'Diferencia de gol' },
                                { label: 'Últ.5', cls: 'text-center hidden lg:table-cell w-28', title: 'Últimos 5 partidos' },
                            ].map(col => (
                                <th key={col.label}
                                    title={col.title}
                                    className={clsx('px-3 py-2.5 text-xs font-bold uppercase', col.cls)}
                                    style={{ color: 'var(--text-faint)', letterSpacing: '0.06em' }}>
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence>
                            {teams.map((team, index) => {
                                const isQualified = index < 8;
                                const gd = team.stats.gf - team.stats.gc;

                                return (
                                    <motion.tr
                                        key={team.id}
                                        layout
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 5 }}
                                        transition={{ duration: 0.22, delay: index * 0.025 }}
                                        className={clsx(getZoneStyle(index, teams.length), 'group cursor-default theme-fade')}
                                        style={{ borderBottom: '1px solid var(--border)' }}
                                    >
                                        {/* # */}
                                        <td className="px-3 py-2.5 text-center">
                                            <span
                                                className="inline-flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full text-[10px] md:text-xs font-bold"
                                                style={isQualified
                                                    ? { background: accentHex, color: '#0A1A2F' }
                                                    : { color: 'var(--text-faint)' }
                                                }
                                            >
                                                {index + 1}
                                            </span>
                                        </td>

                                        {/* Team */}
                                        <td className="px-3 py-2.5">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <img
                                                    src={team.logo}
                                                    alt={team.shortName}
                                                    className="w-5 h-5 md:w-6 md:h-6 object-contain flex-shrink-0"
                                                />
                                                <span className="md:hidden text-xs font-semibold truncate" style={{ color: 'var(--text)' }}>
                                                    {team.shortName}
                                                </span>
                                                <span className="hidden md:block text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
                                                    {team.name}
                                                </span>
                                                {isQualified && (
                                                    <span className="w-1 h-1 rounded-full flex-shrink-0 animate-pulse" style={{ background: accentHex }} />
                                                )}
                                            </div>
                                        </td>

                                        {/* Pts */}
                                        <td className="px-3 py-2.5 text-center">
                                            <span className="font-black text-sm md:text-base" style={{ color: 'var(--text)' }}>
                                                {team.stats.pts}
                                            </span>
                                        </td>

                                        {/* PJ */}
                                        <td className="px-3 py-2.5 text-center text-xs hidden sm:table-cell" style={{ color: 'var(--text-muted)' }}>
                                            {team.stats.played}
                                        </td>

                                        {/* G */}
                                        <td className="px-3 py-2.5 text-center text-xs font-semibold hidden md:table-cell" style={{ color: 'var(--win)' }}>
                                            {team.stats.won}
                                        </td>

                                        {/* E */}
                                        <td className="px-3 py-2.5 text-center text-xs hidden md:table-cell" style={{ color: 'var(--text-muted)' }}>
                                            {team.stats.drawn}
                                        </td>

                                        {/* P */}
                                        <td className="px-3 py-2.5 text-center text-xs font-semibold hidden md:table-cell" style={{ color: 'var(--loss)' }}>
                                            {team.stats.lost}
                                        </td>

                                        {/* DG */}
                                        <td className="px-3 py-2.5 text-center text-xs font-bold hidden sm:table-cell"
                                            style={{ color: gd > 0 ? 'var(--win)' : gd < 0 ? 'var(--loss)' : 'var(--text-faint)' }}>
                                            {gd > 0 ? `+${gd}` : gd}
                                        </td>

                                        {/* Form */}
                                        <td className="px-3 py-2.5 hidden lg:table-cell">
                                            <div className="flex justify-center gap-0.5">
                                                {(team.form || []).map(renderFormBadge)}
                                            </div>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

