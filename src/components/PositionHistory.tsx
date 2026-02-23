'use client';

import React from 'react';
import type { Team } from '@/lib/types';
import clsx from 'clsx';

interface PositionHistoryProps {
    teams: Team[];
    theme?: 'blue' | 'purple' | 'emerald';
}

export const PositionHistory: React.FC<PositionHistoryProps> = ({ teams, theme = 'blue' }) => {
    const [selectedTeam, setSelectedTeam] = React.useState<string>(teams[0]?.id);

    const team = teams.find(t => t.id === selectedTeam) || teams[0];
    if (!team) return null;

    const history = team.positionHistory;
    const maxRounds = history.length;
    const maxTeams = 14; // Rank is 1-14 per zone

    const accentBgMap = {
        blue: "bg-blue-600",
        emerald: "bg-emerald-600",
        purple: "bg-purple-600"
    };

    const accentBg = accentBgMap[theme] || accentBgMap.blue;

    return (
        <div className="p-4 bg-black/20 rounded-xl border border-white/5">
            <div className="flex flex-wrap gap-2 mb-6 max-h-40 overflow-y-auto p-2 bg-black/40 rounded-lg">
                {teams.sort((a, b) => a.name.localeCompare(b.name)).map(t => (
                    <button
                        key={t.id}
                        onClick={() => setSelectedTeam(t.id)}
                        className={clsx(
                            "px-2 py-1 rounded text-[10px] font-bold transition-all flex items-center gap-1",
                            selectedTeam === t.id
                                ? `${accentBg} text-white`
                                : "bg-white/5 text-zinc-500 hover:text-zinc-300"
                        )}
                    >
                        <img src={t.logo} alt="" className="w-3 h-3 object-contain" />
                        {t.shortName}
                    </button>
                ))}
            </div>

            <div className="relative h-64 w-full bg-black/40 rounded-lg border border-white/5 p-4 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-zinc-100 font-bold flex items-center gap-2">
                        <img src={team.logo} alt="" className="w-5 h-5" />
                        {team.name}
                    </h4>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Posición por Fecha</span>
                </div>

                <div className="flex-1 relative mt-2">
                    {/* Y-Axis Labels */}
                    <div className="absolute left-0 top-0 bottom-0 w-6 flex flex-col justify-between text-[10px] text-zinc-500 font-mono">
                        <span>1</span>
                        <span>4</span>
                        <span>8</span>
                        <span>14</span>
                    </div>

                    {/* Chart Area */}
                    <div className="ml-8 mr-2 h-full relative border-l border-b border-white/10">
                        {history.length === 0 ? (
                            <div className="absolute inset-0 flex items-center justify-center text-zinc-600 text-xs italic">
                                Aún no hay datos de fechas jugadas
                            </div>
                        ) : (
                            <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox={`0 0 ${maxRounds - 1 || 1} ${maxTeams - 1}`}>
                                {/* Grid lines */}
                                {[0, 3, 7, 13].map(pos => (
                                    <line
                                        key={pos}
                                        x1="0" y1={pos} x2={maxRounds - 1} y2={pos}
                                        stroke="white" strokeOpacity="0.05" strokeWidth="0.05"
                                    />
                                ))}

                                {/* The Line */}
                                <polyline
                                    fill="none"
                                    stroke={theme === 'blue' ? '#60a5fa' : theme === 'emerald' ? '#34d399' : '#a78bfa'}
                                    strokeWidth="0.1"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    points={history.map((pos, i) => `${i},${pos - 1}`).join(' ')}
                                />

                                {/* Points */}
                                {history.map((pos, i) => (
                                    <circle
                                        key={i}
                                        cx={i}
                                        cy={pos - 1}
                                        r="0.15"
                                        fill={theme === 'blue' ? '#3b82f6' : theme === 'emerald' ? '#10b981' : '#8b5cf6'}
                                        tabIndex={0}
                                        className="focus:outline-none hover:r-[0.25] transition-all cursor-crosshair"
                                    />
                                ))}
                            </svg>
                        )}
                    </div>

                    {/* X-Axis Labels */}
                    <div className="ml-8 mr-2 flex justify-between text-[10px] text-zinc-600 font-mono mt-1">
                        <span>F1</span>
                        {history.length > 2 && <span>F{Math.ceil(history.length / 2)}</span>}
                        {history.length > 0 && <span>F{history.length}</span>}
                    </div>
                </div>
            </div>
        </div>
    );
};

