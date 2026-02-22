import React from 'react';
import type { Team } from '../types';

interface TopScorersProps {
    teams: Team[];
    theme?: 'blue' | 'emerald' | 'purple';
}

export const TopScorers: React.FC<TopScorersProps> = ({ teams, theme = 'blue' }) => {
    // Flatten all players into a single array with team info
    const allPlayers = teams.flatMap(team =>
        team.players.map(player => ({
            ...player,
            teamName: team.name,
            teamShortName: team.shortName
        }))
    );

    // Filter those with goals and sort by goals desc
    const sortedPlayers = allPlayers
        .filter(p => p.goals > 0)
        .sort((a, b) => b.goals - a.goals)
        .slice(0, 10); // Top 10

    if (sortedPlayers.length === 0) {
        return (
            <div className="text-center p-8 text-zinc-500 bg-surface rounded-xl border border-white/5">
                <p>Aún no hay goles registrados.</p>
                <p className="text-xs mt-2">Simulá partidos para ver la tabla de goleadores.</p>
            </div>
        );
    }

    const headerClassMap = {
        blue: "bg-blue-900/80 border-blue-500/10",
        emerald: "bg-emerald-900/80 border-emerald-500/10",
        purple: "bg-purple-900/80 border-purple-500/10"
    };
    const accentTextMap = {
        blue: "text-blue-400",
        emerald: "text-emerald-400",
        purple: "text-purple-400"
    };

    const headerClass = headerClassMap[theme] || headerClassMap.blue;
    const accentTextClass = accentTextMap[theme] || accentTextMap.blue;

    return (
        <div className="bg-surface rounded-xl overflow-hidden shadow-lg border border-white/5 max-w-2xl mx-auto">
            <div className={`${headerClass} p-4 border-b`}>
                <h3 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                    Tabla de Goleadores
                </h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-black/20 text-zinc-400 uppercase text-xs font-semibold">
                        <tr>
                            <th className="px-4 py-3 text-center w-12">#</th>
                            <th className="px-4 py-3">Jugador</th>
                            <th className="px-4 py-3">Club</th>
                            <th className="px-4 py-3 text-center w-16">Goles</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {sortedPlayers.map((player, index) => (
                            <tr key={`${player.teamShortName}-${player.id}`} className="hover:bg-white/5 transition-colors">
                                <td className="px-4 py-3 text-center text-zinc-500 font-mono">
                                    {index + 1}
                                </td>
                                <td className="px-4 py-3 font-medium text-zinc-200">
                                    {player.name}
                                    <span className="ml-2 text-[10px] text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded uppercase">{player.position}</span>
                                </td>
                                <td className="px-4 py-3 text-zinc-400">
                                    <span className="md:hidden">{player.teamShortName}</span>
                                    <span className="hidden md:inline">{player.teamName}</span>
                                </td>
                                <td className={`px-4 py-3 text-center font-bold text-lg ${accentTextClass}`}>
                                    {player.goals}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
