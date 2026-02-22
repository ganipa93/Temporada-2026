import React from 'react';
import type { Team, Zone } from '../types';
import clsx from 'clsx';

interface StandingsTableProps {
    zoneName: string;
    teams: Team[];
    theme?: 'blue' | 'purple';
}

export const StandingsTable: React.FC<StandingsTableProps> = ({ zoneName, teams, theme = 'blue' }) => {
    const headerBg = theme === 'blue' ? "bg-blue-900/80" : "bg-purple-900/80";
    const subTextColor = theme === 'blue' ? "text-blue-100/70" : "text-purple-100/70";

    return (
        <div className="bg-[#0f172a] rounded-xl overflow-hidden shadow-lg border border-white/5">
            <div className={`${headerBg} p-4 border-b border-white/10 flex justify-between items-center`}>
                <h3 className="text-xl font-bold text-white">{zoneName}</h3>
                <span className={`text-xs ${subTextColor} uppercase tracking-wider font-semibold`}>Liga Profesional</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-black/20 text-zinc-400 uppercase text-xs font-semibold">
                        <tr>
                            <th className="px-4 py-3 text-center w-12">#</th>
                            <th className="px-4 py-3">Equipo</th>
                            <th className="px-4 py-3 text-center w-12" title="Puntos">Pts</th>
                            <th className="px-4 py-3 text-center w-12 hidden sm:table-cell" title="Partidos Jugados">PJ</th>
                            <th className="px-4 py-3 text-center w-12 hidden md:table-cell" title="Ganados">G</th>
                            <th className="px-4 py-3 text-center w-12 hidden md:table-cell" title="Empatados">E</th>
                            <th className="px-4 py-3 text-center w-12 hidden md:table-cell" title="Perdidos">P</th>
                            <th className="px-4 py-3 text-center w-12 hidden sm:table-cell" title="Diferencia de Gol">DG</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {teams.map((team, index) => {
                            const isQualified = index < 8;
                            return (
                                <tr key={team.id} className={clsx(
                                    "hover:bg-white/5 transition-colors",
                                    isQualified ? "bg-emerald-500/5" : ""
                                )}>
                                    <td className="px-4 py-3 text-center font-medium">
                                        <span className={clsx(
                                            "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs",
                                            isQualified ? "bg-emerald-500 text-white" : "text-zinc-500"
                                        )}>
                                            {index + 1}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 font-medium text-zinc-200">
                                        <div className="flex items-center gap-3">
                                            <img src={team.logo} alt={team.shortName} className="w-6 h-6 object-contain" />
                                            <div>
                                                <span className="md:hidden">{team.shortName}</span>
                                                <span className="hidden md:inline">{team.name}</span>
                                                {isQualified && <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center font-bold text-white">{team.stats.pts}</td>
                                    <td className="px-4 py-3 text-center text-zinc-400 hidden sm:table-cell">{team.stats.played}</td>
                                    <td className="px-4 py-3 text-center text-zinc-400 hidden md:table-cell">{team.stats.won}</td>
                                    <td className="px-4 py-3 text-center text-zinc-400 hidden md:table-cell">{team.stats.drawn}</td>
                                    <td className="px-4 py-3 text-center text-zinc-400 hidden md:table-cell">{team.stats.lost}</td>
                                    <td className={clsx(
                                        "px-4 py-3 text-center font-medium hidden sm:table-cell",
                                        (team.stats.gf - team.stats.gc) > 0 ? "text-emerald-400" : (team.stats.gf - team.stats.gc) < 0 ? "text-red-400" : "text-zinc-400"
                                    )}>
                                        {team.stats.gf - team.stats.gc}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
