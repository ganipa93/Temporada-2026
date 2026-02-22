import React, { useMemo } from 'react';
import type { Team } from '../types';
import { ArrowDown, Shield } from 'lucide-react';
import clsx from 'clsx';

interface PromediosTableProps {
    teams: Team[];
}

export const PromediosTable: React.FC<PromediosTableProps> = ({ teams }) => {

    // Calculate averages and sort
    const tableData = useMemo(() => {
        return teams.map(team => {
            const pts2024 = team.averages?.pts2024 || 0;
            const pts2025 = team.averages?.pts2025 || 0;
            const pts2026 = team.stats.pts; // Current season points

            const pj2024 = team.averages?.pj2024 || 0;
            const pj2025 = team.averages?.pj2025 || 0;
            const pj2026 = team.stats.played; // Current season games

            const totalPts = pts2024 + pts2025 + pts2026;
            const totalPJ = pj2024 + pj2025 + pj2026;

            const average = totalPJ > 0 ? totalPts / totalPJ : 0;

            return {
                ...team,
                pts2024: team.averages?.pts2024 !== null ? pts2024 : 0,
                pts2025: team.averages?.pts2025 !== null ? pts2025 : 0,
                pts2026,
                totalPts,
                totalPJ,
                average
            };
        }).sort((a, b) => b.average - a.average);
    }, [teams]);

    return (
        <div className="w-full max-w-4xl mx-auto font-sans">
            {/* Header */}
            <div className="bg-[#1e293b] text-white p-3 rounded-t-lg border-b border-white/10 flex justify-between items-center">
                <h2 className="font-bold uppercase tracking-wide text-sm">PROMEDIOS - RELEGATION</h2>
            </div>

            <div className="overflow-x-auto bg-[#0f172a] rounded-b-lg border border-white/10 shadow-xl">
                <table className="w-full text-sm text-center">
                    <thead className="text-xs font-bold text-zinc-400 bg-[#1e293b] uppercase">
                        <tr>
                            <th className="p-3 w-12 text-center text-zinc-500">#</th>
                            <th className="p-3 text-left w-64 text-white">Equipos</th>
                            <th className="p-3 font-bold text-white w-24">Prom</th>
                            <th className="p-3 text-zinc-300">Pts</th>
                            <th className="p-3 text-zinc-400">PJ</th>
                            <th className="p-3 text-zinc-500">24</th>
                            <th className="p-3 text-zinc-500">25</th>
                            <th className="p-3 text-zinc-300">26</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {tableData.map((team, index) => {
                            const isLast = index >= tableData.length - 1; // Last one descends
                            const formattedAvg = team.average.toFixed(3);

                            return (
                                <tr key={team.id} className={clsx(
                                    "transition-colors hover:bg-white/10",
                                    isLast ? "bg-red-900/20" : "bg-zinc-800/50"
                                )}>
                                    <td className="p-2 font-bold text-zinc-500">
                                        {index + 1}
                                    </td>
                                    <td className="p-2 text-left font-bold text-white flex items-center gap-3">
                                        <img src={team.logo} alt={team.name} className="w-6 h-6 object-contain shrink-0" />
                                        <span className={clsx(isLast ? "text-red-400" : "text-white")}>{team.name}</span>
                                        {isLast && <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded ml-2">DESC</span>}
                                    </td>
                                    <td className="p-2 font-black text-white text-base font-mono bg-white/5">
                                        {formattedAvg}
                                    </td>
                                    <td className="p-2 font-bold text-zinc-300">{team.totalPts}</td>
                                    <td className="p-2 text-zinc-500">{team.totalPJ}</td>
                                    <td className="p-2 text-zinc-600 text-xs">{team.pts2024}</td>
                                    <td className="p-2 text-zinc-600 text-xs">{team.pts2025}</td>
                                    <td className="p-2 text-zinc-300 font-bold">{team.pts2026}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <div className="mt-2 text-[10px] text-zinc-500 text-right">
                * Tabla de promedios simulada basada en datos históricos proporcionados.
            </div>
        </div>
    );
};
