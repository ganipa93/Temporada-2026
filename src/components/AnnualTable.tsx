import React, { useMemo } from 'react';
import type { Team } from '../types';
import { ArrowDown } from 'lucide-react';
import clsx from 'clsx';

interface AnnualTableProps {
    teams: Team[];
}

export const AnnualTable: React.FC<AnnualTableProps> = ({ teams }) => {

    // Calculate Annual stats (Just 2026 points)
    const tableData = useMemo(() => {
        return teams.map(team => {
            // stats in 'teams' prop passed here should already be the "Combined 2026 Stats"
            // if we use getCombinedStats() from the hook.
            // Let's verify usage in App.tsx later.
            return team;
        }).sort((a, b) =>
            b.stats.pts - a.stats.pts ||
            b.stats.goalDiff - a.stats.goalDiff ||
            b.stats.gf - a.stats.gf
        );
    }, [teams]);

    return (
        <div className="w-full max-w-4xl mx-auto font-sans">
            <div className="mb-4 text-sm text-zinc-400 p-4 bg-white/5 rounded-lg border border-white/5 space-y-2">
                <p>
                    <strong className="text-zinc-200">Tabla Anual 2026.</strong> Suma de puntos de los torneos Apertura y Clausura.
                </p>
                <div className="flex flex-wrap gap-4 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                        <span>Clasifica a Copa Libertadores 2027</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500/20 border border-blue-500/50"></div>
                        <span>Clasifica a Copa Sudamericana 2027</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                        <span>Descenso por Tabla Anual</span>
                    </div>
                </div>
            </div>

            <div className="bg-zinc-900 text-white p-3 rounded-t-lg border-b border-white/10 flex justify-between items-center">
                <h2 className="font-bold uppercase tracking-wide text-sm">TABLA ANUAL 2026 (Annual Standings)</h2>
            </div>

            <div className="overflow-x-auto bg-[#0f172a] rounded-b-lg border border-white/10 shadow-xl">
                <table className="w-full text-sm text-center">
                    <thead className="text-xs font-bold text-zinc-400 bg-zinc-900 uppercase">
                        <tr>
                            <th className="p-3 w-12 text-center">#</th>
                            <th className="p-3 text-left w-64 text-white">Equipo</th>
                            <th className="p-3 font-bold text-white">Pts</th>
                            <th className="p-3">PJ</th>
                            <th className="p-3">PG</th>
                            <th className="p-3">PE</th>
                            <th className="p-3">PP</th>
                            <th className="p-3">GF</th>
                            <th className="p-3">GC</th>
                            <th className="p-3">Dif</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {tableData.map((team, index) => {
                            const isLast = index === tableData.length - 1;
                            const isLibertadores = index < 3;
                            const isSudamericana = index >= 3 && index < 9;

                            return (
                                <tr key={team.id} className={clsx(
                                    "transition-colors hover:bg-white/10",
                                    isLast && "bg-red-900/20",
                                    isLibertadores && "bg-yellow-500/10",
                                    isSudamericana && "bg-blue-500/10",
                                    (!isLast && !isLibertadores && !isSudamericana) && "bg-zinc-800/50"
                                )}>
                                    <td className={clsx("p-3 font-bold",
                                        isLast ? "text-red-400" : isLibertadores ? "text-yellow-400" : isSudamericana ? "text-blue-400" : "text-zinc-500"
                                    )}>
                                        {index + 1}
                                    </td>
                                    <td className="p-3 text-left font-bold text-white flex items-center gap-3">
                                        <img src={team.logo} alt={team.name} className="w-6 h-6 object-contain shrink-0" />
                                        <span className={clsx(isLast && "text-red-300", isLibertadores && "text-yellow-100", isSudamericana && "text-blue-100")}>{team.name}</span>
                                        {isLast && <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded ml-2">DESC</span>}
                                        {isLibertadores && <span className="text-[10px] bg-yellow-600/80 text-white px-1.5 py-0.5 rounded ml-2 border border-yellow-500/50">LIB</span>}
                                        {isSudamericana && <span className="text-[10px] bg-blue-600/80 text-white px-1.5 py-0.5 rounded ml-2 border border-blue-500/50">SUD</span>}
                                    </td>
                                    <td className="p-3 font-black text-white text-base bg-white/5">
                                        {team.stats.pts}
                                    </td>
                                    <td className="p-3 text-zinc-400">{team.stats.played}</td>
                                    <td className="p-3 text-emerald-400">{team.stats.won}</td>
                                    <td className="p-3 text-zinc-400">{team.stats.drawn}</td>
                                    <td className="p-3 text-red-400">{team.stats.lost}</td>
                                    <td className="p-3 text-zinc-400 hidden sm:table-cell">{team.stats.gf}</td>
                                    <td className="p-3 text-zinc-400 hidden sm:table-cell">{team.stats.gc}</td>
                                    <td className="p-3 font-medium text-zinc-300">{team.stats.goalDiff > 0 ? `+${team.stats.goalDiff}` : team.stats.goalDiff}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
