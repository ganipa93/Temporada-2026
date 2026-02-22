import React, { useState } from 'react';
import type { Team } from '../types';
import { Trophy, Shield } from 'lucide-react';
import clsx from 'clsx';

interface PlayoffBracketProps {
    qualifiedTeams: {
        A: Team[];
        B: Team[];
    };
    theme?: 'blue' | 'emerald' | 'purple';
}

export const PlayoffBracket: React.FC<PlayoffBracketProps> = ({ qualifiedTeams, theme = 'blue' }) => {
    // Stage 1: Octavos (Round of 16) - 8 Matches
    // Cross: 1A vs 8B, 2A vs 7B, 3A vs 6B, 4A vs 5B...

    // State for winners
    const [octavosWinners, setOctavosWinners] = useState<(Team | null)[]>(Array(8).fill(null));
    const [cuartosWinners, setCuartosWinners] = useState<(Team | null)[]>(Array(4).fill(null));
    const [semisWinners, setSemisWinners] = useState<(Team | null)[]>(Array(2).fill(null));
    const [champion, setChampion] = useState<Team | null>(null);

    // Initial Pairings (Octavos)
    const octavosMatches = [
        { home: qualifiedTeams.A[0], away: qualifiedTeams.B[7] }, // M1: 1A vs 8B
        { home: qualifiedTeams.B[3], away: qualifiedTeams.A[4] }, // M2: 4B vs 5A
        { home: qualifiedTeams.B[1], away: qualifiedTeams.A[6] }, // M3: 2B vs 7A
        { home: qualifiedTeams.A[2], away: qualifiedTeams.B[5] }, // M4: 3A vs 6B

        { home: qualifiedTeams.B[0], away: qualifiedTeams.A[7] }, // M5: 1B vs 8A
        { home: qualifiedTeams.A[3], away: qualifiedTeams.B[4] }, // M6: 4A vs 5B
        { home: qualifiedTeams.A[1], away: qualifiedTeams.B[6] }, // M7: 2A vs 7B
        { home: qualifiedTeams.B[2], away: qualifiedTeams.A[5] }, // M8: 3B vs 6A
    ];

    const handleAdvance = (stage: 'octavos' | 'cuartos' | 'semis' | 'final', matchIndex: number, winner: Team) => {
        if (stage === 'octavos') {
            const newWinners = [...octavosWinners];
            newWinners[matchIndex] = winner;
            setOctavosWinners(newWinners);
            // Reset subsequent
            setCuartosWinners(Array(4).fill(null));
            setSemisWinners(Array(2).fill(null));
            setChampion(null);
        } else if (stage === 'cuartos') {
            const newWinners = [...cuartosWinners];
            newWinners[matchIndex] = winner;
            setCuartosWinners(newWinners);
            setSemisWinners(Array(2).fill(null));
            setChampion(null);
        } else if (stage === 'semis') {
            const newWinners = [...semisWinners];
            newWinners[matchIndex] = winner;
            setSemisWinners(newWinners);
            setChampion(null);
        } else {
            setChampion(winner);
        }
    };

    const TeamSlot = ({ team, isWinner, onClick, align = 'left', label }: { team?: Team, isWinner?: boolean, onClick: () => void, align?: string, label: string }) => {
        const winnerClasses = {
            blue: "bg-blue-500/20 border-blue-500 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.2)]",
            emerald: "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]",
            purple: "bg-purple-500/20 border-purple-500 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
        };
        const winnerClass = winnerClasses[theme] || winnerClasses.blue;

        return (
            <div
                onClick={() => team && onClick()}
                className={clsx(
                    "p-2 rounded cursor-pointer border transition-all flex items-center gap-2 min-w-[140px]",
                    !team ? "bg-white/5 border-white/5 opacity-50" :
                        isWinner ? winnerClass :
                            "bg-zinc-800 border-white/10 hover:bg-white/10",
                    align === 'right' ? "flex-row-reverse text-right" : "flex-row text-left"
                )}
            >
                {team ? (
                    <>
                        <img src={team.logo} alt={team.name} className="w-6 h-6 object-contain shrink-0" />
                        <div className="flex flex-col leading-none">
                            <span className="text-[10px] text-zinc-400 font-mono mb-0.5">{label}</span>
                            <span className="font-bold text-xs md:text-sm truncate">{team.name}</span>
                        </div>
                    </>
                ) : (
                    <span className="text-zinc-600 text-xs italic">TBD</span>
                )}
            </div>
        );
    };

    return (
        <div className="flex gap-8 overflow-x-auto p-4 min-w-[1000px]">
            {/* OCTAVOS */}
            <div className="flex flex-col justify-around gap-4">
                <h3 className="text-center font-bold text-zinc-500 text-sm uppercase mb-2">Octavos</h3>
                {octavosMatches.map((match, i) => (
                    <div key={i} className="flex flex-col gap-1 relative">
                        <TeamSlot
                            team={match.home}
                            isWinner={octavosWinners[i]?.id === match.home?.id}
                            onClick={() => match.home && handleAdvance('octavos', i, match.home)}
                            label={match.home ? "Local" : "-"}
                        />
                        <TeamSlot
                            team={match.away}
                            isWinner={octavosWinners[i]?.id === match.away?.id}
                            onClick={() => match.away && handleAdvance('octavos', i, match.away)}
                            label={match.away ? "Visita" : "-"}
                        />
                        <div className="absolute -right-4 top-1/2 w-4 h-[1px] bg-white/10"></div>
                    </div>
                ))}
            </div>

            {/* CUARTOS */}
            <div className="flex flex-col justify-around gap-4">
                <h3 className="text-center font-bold text-zinc-500 text-sm uppercase mb-2">Cuartos</h3>
                {Array.from({ length: 4 }).map((_, i) => {
                    const home = octavosWinners[i * 2];
                    const away = octavosWinners[i * 2 + 1];
                    const idx = i;
                    return (
                        <div key={i} className="flex flex-col gap-1 relative">
                            <TeamSlot
                                team={home || undefined}
                                isWinner={cuartosWinners[idx]?.id === home?.id}
                                onClick={() => home && away && handleAdvance('cuartos', idx, home)}
                                label={home ? "Local" : "-"}
                            />
                            <TeamSlot
                                team={away || undefined}
                                isWinner={cuartosWinners[idx]?.id === away?.id}
                                onClick={() => home && away && handleAdvance('cuartos', idx, away)}
                                label={away ? "Visita" : "-"}
                            />
                            <div className="absolute -right-4 top-1/2 w-4 h-[1px] bg-white/10"></div>
                        </div>
                    );
                })}
            </div>

            {/* SEMIS */}
            <div className="flex flex-col justify-around gap-4">
                <h3 className="text-center font-bold text-zinc-500 text-sm uppercase mb-2">Semifinal</h3>
                {Array.from({ length: 2 }).map((_, i) => {
                    const home = cuartosWinners[i * 2];
                    const away = cuartosWinners[i * 2 + 1];
                    const idx = i;
                    return (
                        <div key={i} className="flex flex-col gap-1 relative">
                            <TeamSlot
                                team={home || undefined}
                                isWinner={semisWinners[idx]?.id === home?.id}
                                onClick={() => home && away && handleAdvance('semis', idx, home)}
                                label={home ? "Local" : "-"}
                            />
                            <TeamSlot
                                team={away || undefined}
                                isWinner={semisWinners[idx]?.id === away?.id}
                                onClick={() => home && away && handleAdvance('semis', idx, away)}
                                label={away ? "Visita" : "-"}
                            />
                            <div className="absolute -right-4 top-1/2 w-4 h-[1px] bg-white/10"></div>
                        </div>
                    );
                })}
            </div>

            {/* FINAL */}
            <div className="flex flex-col justify-around gap-4">
                <h3 className="text-center font-bold text-amber-500 text-sm uppercase mb-2">Gran Final</h3>
                <div className="flex flex-col gap-1">
                    <TeamSlot
                        team={semisWinners[0] || undefined}
                        isWinner={champion?.id === semisWinners[0]?.id}
                        onClick={() => semisWinners[0] && semisWinners[1] && handleAdvance('final', 0, semisWinners[0])}
                        label="Neutral"
                    />
                    <TeamSlot
                        team={semisWinners[1] || undefined}
                        isWinner={champion?.id === semisWinners[1]?.id}
                        onClick={() => semisWinners[0] && semisWinners[1] && handleAdvance('final', 0, semisWinners[1])}
                        label="Neutral"
                    />
                </div>
                {champion && (
                    <div className="mt-8 text-center animate-in zoom-in slide-in-from-bottom-4 duration-700">
                        <Trophy className="text-amber-400 mx-auto mb-2 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" size={48} />
                        <div className="text-sm text-amber-200 uppercase tracking-widest font-bold">Campeón 2026</div>
                        <div className="text-3xl font-black text-white">{champion.name}</div>
                    </div>
                )}
            </div>
        </div>
    );
};
