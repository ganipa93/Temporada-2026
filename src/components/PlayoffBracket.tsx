'use client';

import React, { useState } from 'react';
import type { Team } from '@/lib/types';
import { Trophy } from 'lucide-react';


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
        const accentColor = theme === 'purple' ? '#C084FC' : '#4FC3F7';
        const accentBg = theme === 'purple' ? 'rgba(192,132,252,0.12)' : 'rgba(79,195,247,0.12)';
        const glowShadow = theme === 'purple'
            ? '0 0 12px rgba(192,132,252,0.25)'
            : '0 0 12px rgba(79,195,247,0.25)';

        return (
            <div
                onClick={() => team && onClick()}
                className="p-2 rounded-lg cursor-pointer border transition-all flex items-center gap-2 min-w-[140px] theme-fade"
                style={!team
                    ? { background: 'var(--surface-3)', borderColor: 'var(--border)', opacity: 0.5 }
                    : isWinner
                        ? { background: accentBg, borderColor: accentColor, boxShadow: glowShadow }
                        : { background: 'var(--surface-2)', borderColor: 'var(--border-strong)' }
                }
            >
                {team ? (
                    <>
                        <img src={team.logo} alt={team.name} className="w-6 h-6 object-contain shrink-0" />
                        <div className={`flex flex-col leading-none ${align === 'right' ? 'items-end' : ''}`}>
                            <span className="text-[10px] font-mono mb-0.5" style={{ color: 'var(--text-faint)' }}>{label}</span>
                            <span className="font-bold text-xs md:text-sm truncate" style={{ color: isWinner ? accentColor : 'var(--text)' }}>{team.name}</span>
                        </div>
                    </>
                ) : (
                    <span className="text-xs italic" style={{ color: 'var(--text-faint)' }}>TBD</span>
                )}
            </div>
        );
    };

    return (
        <div className="flex gap-8 overflow-x-auto p-4 min-w-[1000px]">
            {/* OCTAVOS */}
            <div className="flex flex-col justify-around gap-4">
                <h3 className="text-center font-black text-xs uppercase mb-2 tracking-widest" style={{ color: 'var(--text-faint)' }}>Octavos</h3>
                {octavosMatches.map((match, i) => (
                    <div key={i} className="flex flex-col gap-1 relative">
                        <TeamSlot team={match.home} isWinner={octavosWinners[i]?.id === match.home?.id} onClick={() => match.home && handleAdvance('octavos', i, match.home)} label={match.home ? 'Local' : '-'} />
                        <TeamSlot team={match.away} isWinner={octavosWinners[i]?.id === match.away?.id} onClick={() => match.away && handleAdvance('octavos', i, match.away)} label={match.away ? 'Visita' : '-'} />
                        <div className="absolute -right-4 top-1/2 w-4 h-px" style={{ background: 'var(--border-strong)' }} />
                    </div>
                ))}
            </div>

            {/* CUARTOS */}
            <div className="flex flex-col justify-around gap-4">
                <h3 className="text-center font-black text-xs uppercase mb-2 tracking-widest" style={{ color: 'var(--text-faint)' }}>Cuartos</h3>
                {Array.from({ length: 4 }).map((_, i) => {
                    const home = octavosWinners[i * 2];
                    const away = octavosWinners[i * 2 + 1];
                    return (
                        <div key={i} className="flex flex-col gap-1 relative">
                            <TeamSlot team={home || undefined} isWinner={cuartosWinners[i]?.id === home?.id} onClick={() => home && away && handleAdvance('cuartos', i, home)} label={home ? 'Local' : '-'} />
                            <TeamSlot team={away || undefined} isWinner={cuartosWinners[i]?.id === away?.id} onClick={() => home && away && handleAdvance('cuartos', i, away)} label={away ? 'Visita' : '-'} />
                            <div className="absolute -right-4 top-1/2 w-4 h-px" style={{ background: 'var(--border-strong)' }} />
                        </div>
                    );
                })}
            </div>

            {/* SEMIS */}
            <div className="flex flex-col justify-around gap-4">
                <h3 className="text-center font-black text-xs uppercase mb-2 tracking-widest" style={{ color: 'var(--text-faint)' }}>Semifinal</h3>
                {Array.from({ length: 2 }).map((_, i) => {
                    const home = cuartosWinners[i * 2];
                    const away = cuartosWinners[i * 2 + 1];
                    return (
                        <div key={i} className="flex flex-col gap-1 relative">
                            <TeamSlot team={home || undefined} isWinner={semisWinners[i]?.id === home?.id} onClick={() => home && away && handleAdvance('semis', i, home)} label={home ? 'Local' : '-'} />
                            <TeamSlot team={away || undefined} isWinner={semisWinners[i]?.id === away?.id} onClick={() => home && away && handleAdvance('semis', i, away)} label={away ? 'Visita' : '-'} />
                            <div className="absolute -right-4 top-1/2 w-4 h-px" style={{ background: 'var(--border-strong)' }} />
                        </div>
                    );
                })}
            </div>

            {/* FINAL */}
            <div className="flex flex-col justify-around gap-4">
                <h3 className="text-center font-black text-xs uppercase mb-2 tracking-widest" style={{ color: 'var(--gold)' }}>Gran Final</h3>
                <div className="flex flex-col gap-1">
                    <TeamSlot team={semisWinners[0] || undefined} isWinner={champion?.id === semisWinners[0]?.id} onClick={() => semisWinners[0] && semisWinners[1] && handleAdvance('final', 0, semisWinners[0])} label="Neutral" />
                    <TeamSlot team={semisWinners[1] || undefined} isWinner={champion?.id === semisWinners[1]?.id} onClick={() => semisWinners[0] && semisWinners[1] && handleAdvance('final', 0, semisWinners[1])} label="Neutral" />
                </div>
                {champion && (
                    <div className="mt-8 text-center">
                        <Trophy style={{ color: 'var(--gold)' }} className="mx-auto mb-2 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" size={48} />
                        <div className="text-xs uppercase tracking-widest font-bold mb-1" style={{ color: 'var(--gold)' }}>Campeón 2026</div>
                        <div className="text-2xl font-black" style={{ color: 'var(--text)' }}>{champion.name}</div>
                    </div>
                )}
            </div>
        </div>
    );
};

