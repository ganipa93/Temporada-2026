'use client';

import React, { useMemo } from 'react';
import type { Team } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

interface PromediosTableProps {
    teams: Team[];
}

export const PromediosTable: React.FC<PromediosTableProps> = ({ teams }) => {
    const tableData = useMemo(() => {
        return teams.map(team => {
            const pts2024 = team.averages?.pts2024 || 0;
            const pts2025 = team.averages?.pts2025 || 0;
            const pts2026 = team.stats.pts;
            const pj2024 = team.averages?.pj2024 || 0;
            const pj2025 = team.averages?.pj2025 || 0;
            const pj2026 = team.stats.played;
            const totalPts = pts2024 + pts2025 + pts2026;
            const totalPJ = pj2024 + pj2025 + pj2026;
            const average = totalPJ > 0 ? totalPts / totalPJ : 0;
            return { ...team, pts2024, pts2025, pts2026, totalPts, totalPJ, average };
        }).sort((a, b) => b.average - a.average);
    }, [teams]);

    const descending = tableData.length > 0 ? tableData[tableData.length - 1].id : null;

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Header Card */}
            <div className="card theme-fade overflow-hidden">
                <div className="px-4 py-3 flex items-center justify-between"
                    style={{ background: 'linear-gradient(135deg, #0D2240 0%, #1C3A5C 100%)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    <div>
                        <h2 className="font-black text-white uppercase tracking-widest text-xs">Tabla de Promedios</h2>
                        <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>Descenso por Rendimiento — Temporadas 2024/25/26</p>
                    </div>
                    <span className="text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider"
                        style={{ background: 'rgba(239,68,68,0.2)', color: '#F87171', border: '1px solid rgba(239,68,68,0.3)' }}>
                        Zona de Descenso
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-center compact-table">
                        <thead style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                            <tr>
                                {['#', 'Equipo', 'Prom.', 'Pts', 'PJ', '2024', '2025', '2026'].map(h => (
                                    <th key={h} style={{ color: 'var(--text-faint)', letterSpacing: '0.05em' }}
                                        className={`px-3 py-2.5 text-xs font-bold uppercase ${h === 'Equipo' ? 'text-left' : ''}`}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {tableData.map((team, index) => {
                                    const isDesc = team.id === descending;
                                    const rowBg = isDesc ? 'rgba(239,68,68,0.07)' : 'transparent';

                                    return (
                                        <motion.tr
                                            key={team.id}
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.02 }}
                                            style={{ background: rowBg, borderBottom: '1px solid var(--border)' }}
                                            className="theme-fade"
                                        >
                                            <td className="px-3 py-2.5 font-bold text-center"
                                                style={{ color: isDesc ? 'var(--loss)' : 'var(--text-faint)' }}>
                                                {index + 1}
                                            </td>
                                            <td className="px-3 py-2.5 text-left">
                                                <div className="flex items-center gap-2">
                                                    <img src={team.logo} alt={team.name} className="w-5 h-5 object-contain flex-shrink-0" />
                                                    <span className="font-semibold text-sm" style={{ color: isDesc ? 'var(--loss)' : 'var(--text)' }}>
                                                        {team.name}
                                                    </span>
                                                    {isDesc && (
                                                        <span className="text-[9px] px-1 py-0.5 rounded font-black uppercase text-white"
                                                            style={{ background: 'var(--loss)' }}>
                                                            ▼ DESC
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-3 py-2.5 font-black text-base font-mono" style={{ color: 'var(--accent)' }}>
                                                {team.average.toFixed(3)}
                                            </td>
                                            <td className="px-3 py-2.5 font-bold" style={{ color: 'var(--text)' }}>{team.totalPts}</td>
                                            <td className="px-3 py-2.5" style={{ color: 'var(--text-muted)' }}>{team.totalPJ}</td>
                                            <td className="px-3 py-2.5 text-xs" style={{ color: 'var(--text-faint)' }}>{team.pts2024}</td>
                                            <td className="px-3 py-2.5 text-xs" style={{ color: 'var(--text-faint)' }}>{team.pts2025}</td>
                                            <td className="px-3 py-2.5 font-bold" style={{ color: 'var(--text-muted)' }}>{team.pts2026}</td>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            <p className="mt-2 text-[10px] text-right" style={{ color: 'var(--text-faint)' }}>
                * Promedios calculados en base a datos históricos proporcionados.
            </p>
        </div>
    );
};

