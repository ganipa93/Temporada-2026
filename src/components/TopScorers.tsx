'use client';

import React from 'react';
import type { Team } from '@/lib/types';
import clsx from 'clsx';
import { PositionHistory } from './PositionHistory';
import { motion, AnimatePresence } from 'framer-motion';

interface TopScorersProps {
    teams: Team[];
    theme?: 'blue' | 'emerald' | 'purple';
}

export const TopScorers: React.FC<TopScorersProps> = ({ teams, theme = 'blue' }) => {
    const [activeStat, setActiveStat] = React.useState<'goals' | 'assists' | 'yellowCards' | 'redCards' | 'streaks' | 'teams' | 'history'>('goals');
    const [streakType, setStreakType] = React.useState<'win' | 'unbeaten' | 'loss'>('win');
    const [teamStatType, setTeamStatType] = React.useState<'home' | 'away' | 'avgGoals'>('home');

    // Flatten all players into a single array with team info
    const allPlayers = teams.flatMap(team =>
        team.players.map(player => ({
            ...player,
            teamName: team.name,
            teamShortName: team.shortName
        }))
    );

    // Filter those with the active stat > 0 and sort
    const sortedPlayers = activeStat === 'streaks' ? [] : allPlayers
        .filter(p => (p as any)[activeStat] > 0)
        .sort((a, b) => (b as any)[activeStat] - (a as any)[activeStat])
        .slice(0, 10); // Top 10

    const sortedTeams = activeStat === 'streaks' ? [...teams]
        .filter(t => t.streaks[streakType] > 0)
        .sort((a, b) => b.streaks[streakType] - a.streaks[streakType])
        .slice(0, 10) : activeStat === 'teams' ? [...teams]
            .sort((a, b) => {
                if (teamStatType === 'home') return b.homeStats.pts - a.homeStats.pts || (b.homeStats.gf - b.homeStats.gc) - (a.homeStats.gf - a.homeStats.gc);
                if (teamStatType === 'away') return b.awayStats.pts - a.awayStats.pts || (b.awayStats.gf - b.awayStats.gc) - (a.awayStats.gf - a.awayStats.gc);
                const avgA = a.stats.played > 0 ? a.stats.gf / a.stats.played : 0;
                const avgB = b.stats.played > 0 ? b.stats.gf / b.stats.played : 0;
                return avgB - avgA;
            })
            .slice(0, 10) : [];

    const headerClassMap = {
        blue: "border-blue-500/10",
        emerald: "border-emerald-500/10",
        purple: "border-purple-500/10"
    };

    const accentBgMap = {
        blue: "bg-blue-600",
        emerald: "bg-emerald-600",
        purple: "bg-purple-600"
    };

    const accentTextMap = {
        blue: "text-blue-400",
        emerald: "text-emerald-400",
        purple: "text-purple-400"
    };

    const headerClass = headerClassMap[theme] || headerClassMap.blue;
    const accentBgClass = accentBgMap[theme] || accentBgMap.blue;
    const accentTextClass = accentTextMap[theme] || accentTextMap.blue;

    const statLabels: Record<string, string> = {
        goals: 'Goles',
        assists: 'Asistencias',
        yellowCards: 'Amarillas',
        redCards: 'Rojas',
        streaks: 'Rachas',
        teams: 'Equipos',
        history: 'Historial'
    };

    const teamStatLabels: Record<string, string> = {
        home: 'Local',
        away: 'Visitante',
        avgGoals: 'Prom. Goles'
    };

    const streakLabels: Record<string, string> = {
        win: 'Victorias seguidas',
        unbeaten: 'Invictos',
        loss: 'Derrotas seguidas'
    };

    return (
        <div className="rounded-xl overflow-hidden shadow-lg border w-full theme-fade"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className={`p-3 md:p-4 border-b ${headerClass}`}
                style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}>
                <div className="flex flex-wrap gap-2">
                    <div className="flex gap-2 p-1 bg-black/40 rounded-lg w-fit">
                        {(['goals', 'assists', 'yellowCards', 'redCards', 'streaks', 'teams', 'history'] as const).map(stat => (
                            <button
                                key={stat}
                                onClick={() => setActiveStat(stat)}
                                className={clsx(
                                    "px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                                    activeStat === stat
                                        ? `${accentBgClass} text-white shadow-lg`
                                        : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                                )}
                            >
                                {statLabels[stat]}
                            </button>
                        ))}
                    </div>

                    {activeStat === 'teams' && (
                        <div className="flex gap-2 p-1 bg-black/40 rounded-lg w-fit">
                            {(['home', 'away', 'avgGoals'] as const).map(type => (
                                <button
                                    key={type}
                                    onClick={() => setTeamStatType(type)}
                                    className={clsx(
                                        "px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                                        teamStatType === type
                                            ? `${accentBgClass} text-white shadow-lg`
                                            : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                                    )}
                                >
                                    {teamStatLabels[type]}
                                </button>
                            ))}
                        </div>
                    )}

                    {activeStat === 'streaks' && (
                        <div className="flex gap-2 p-1 bg-black/40 rounded-lg w-fit">
                            {(['win', 'unbeaten', 'loss'] as const).map(type => (
                                <button
                                    key={type}
                                    onClick={() => setStreakType(type)}
                                    className={clsx(
                                        "px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                                        streakType === type
                                            ? `${accentBgClass} text-white shadow-lg`
                                            : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                                    )}
                                >
                                    {type === 'win' ? 'Victorias' : type === 'unbeaten' ? 'Invictos' : 'Derrotas'}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {activeStat === 'history' ? (
                <PositionHistory teams={teams} theme={theme} />
            ) : activeStat === 'teams' ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-black/20 text-zinc-400 uppercase text-xs font-semibold">
                            {teamStatType === 'avgGoals' ? (
                                <tr>
                                    <th className="px-4 py-3 text-center w-12">#</th>
                                    <th className="px-4 py-3">Club</th>
                                    <th className="px-4 py-3 text-center">PJ</th>
                                    <th className="px-4 py-3 text-center">Goles</th>
                                    <th className="px-4 py-3 text-center w-32">Promedio</th>
                                </tr>
                            ) : (
                                <tr>
                                    <th className="px-4 py-3 text-center w-12">#</th>
                                    <th className="px-4 py-3">Club</th>
                                    <th className="px-4 py-3 text-center">PJ</th>
                                    <th className="px-4 py-3 text-center">G</th>
                                    <th className="px-4 py-3 text-center">E</th>
                                    <th className="px-4 py-3 text-center">P</th>
                                    <th className="px-4 py-3 text-center">GF/GC</th>
                                    <th className="px-4 py-3 text-center w-24">Pts</th>
                                </tr>
                            )}
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {sortedTeams.map((team, index) => {
                                const s = teamStatType === 'home' ? team.homeStats : team.awayStats;
                                return (
                                    <tr key={team.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3 text-center text-zinc-500 font-mono">
                                            {index + 1}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-zinc-200">
                                            <div className="flex items-center gap-2">
                                                <img src={team.logo} alt={team.shortName} className="w-5 h-5 object-contain" />
                                                <span>{team.name}</span>
                                            </div>
                                        </td>
                                        {teamStatType === 'avgGoals' ? (
                                            <>
                                                <td className="px-4 py-3 text-center text-zinc-400">{team.stats.played}</td>
                                                <td className="px-4 py-3 text-center text-zinc-400">{team.stats.gf}</td>
                                                <td className={`px-4 py-3 text-center font-bold text-lg ${accentTextClass}`}>
                                                    {(team.stats.gf / (team.stats.played || 1)).toFixed(2)}
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="px-4 py-3 text-center text-zinc-400">{s.played}</td>
                                                <td className="px-4 py-3 text-center text-zinc-400">{s.won}</td>
                                                <td className="px-4 py-3 text-center text-zinc-400">{s.drawn}</td>
                                                <td className="px-4 py-3 text-center text-zinc-400">{s.lost}</td>
                                                <td className="px-4 py-3 text-center text-zinc-400">{s.gf}-{s.gc}</td>
                                                <td className={`px-4 py-3 text-center font-bold text-lg ${accentTextClass}`}>
                                                    {s.pts}
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            ) : activeStat === 'streaks' ? (
                sortedTeams.length === 0 ? (
                    <div className="text-center p-12 text-zinc-500">
                        <p>Aún no hay rachas de {streakLabels[streakType].toLowerCase()} registradas.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-black/20 text-zinc-400 uppercase text-xs font-semibold">
                                <tr>
                                    <th className="px-4 py-3 text-center w-12">#</th>
                                    <th className="px-4 py-3">Club</th>
                                    <th className="px-4 py-3 text-center w-32">{streakLabels[streakType]}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {sortedTeams.map((team, index) => (
                                    <tr key={team.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3 text-center text-zinc-500 font-mono">
                                            {index + 1}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-zinc-200">
                                            <div className="flex items-center gap-2">
                                                <img src={team.logo} alt={team.shortName} className="w-5 h-5 object-contain" />
                                                <span>{team.name}</span>
                                            </div>
                                        </td>
                                        <td className={`px-4 py-3 text-center font-bold text-lg ${accentTextClass}`}>
                                            {team.streaks[streakType]}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            ) : sortedPlayers.length === 0 ? (
                <div className="text-center p-12 text-zinc-500">
                    <p>Aún no hay {statLabels[activeStat].toLowerCase()} registrados.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-black/20 text-zinc-400 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-4 py-3 text-center w-12">#</th>
                                <th className="px-4 py-3">Jugador</th>
                                <th className="px-4 py-3">Club</th>
                                <th className="px-4 py-3 text-center w-24">{statLabels[activeStat]}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {sortedPlayers.map((player, index) => (
                                    <motion.tr
                                        key={`${player.teamShortName}-${player.id}`}
                                        layout
                                        initial={{ opacity: 0, y: -6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2, delay: index * 0.03 }}
                                        className="hover:brightness-110 transition-all cursor-default"
                                        style={{ borderBottom: '1px solid var(--border)' }}
                                    >
                                        <td className="px-3 md:px-4 py-2.5 text-center font-mono text-sm"
                                            style={{ color: index === 0 ? 'var(--accent)' : 'var(--text-faint)' }}>
                                            {index + 1}
                                        </td>
                                        <td className="px-3 md:px-4 py-2.5 font-medium text-sm" style={{ color: 'var(--text)' }}>
                                            {player.name}
                                            <span className="ml-1.5 text-[9px] px-1 py-0.5 rounded uppercase font-bold"
                                                style={{ background: 'var(--surface-2)', color: 'var(--text-faint)' }}>{player.position}</span>
                                        </td>
                                        <td className="px-3 md:px-4 py-2.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                                            <span className="md:hidden">{player.teamShortName}</span>
                                            <span className="hidden md:inline">{player.teamName}</span>
                                        </td>
                                        <td className={`px-3 md:px-4 py-2.5 text-center font-black text-lg ${accentTextClass}`}>
                                            {(player as any)[activeStat]}
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

