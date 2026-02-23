'use client';

import { useState, useMemo } from 'react';
import { useTournament } from '@/hooks/useTournament';
import { StandingsTable } from '@/components/StandingsTable';
import { MatchList } from '@/components/MatchList';
import { PlayoffBracket } from '@/components/PlayoffBracket';
import { TopScorers } from '@/components/TopScorers';
import { ProbabilityPanel } from '@/components/ProbabilityPanel';
import { EnVivo } from '@/components/simulacion/EnVivo';
import { PartidosEnVivo } from '@/components/en-vivo/PartidosEnVivo';
import { LayoutGrid, Trophy, PlayCircle, FastForward, RotateCcw, Medal, BarChart3, Radio, Tv } from 'lucide-react';

interface Props {
    tournament: 'apertura' | 'clausura';
}

type SubTab = 'regular' | 'playoffs' | 'scorers' | 'proyecciones' | 'simulacion' | 'envivo';

export function TournamentPage({ tournament }: Props) {
    const {
        teams, matches,
        simulateMatch, simulateNextRound, simulateAll, resetTournament,
        getStandings, bulkUpdateMatches, syncMatchesWithRealData
    } = useTournament();

    const [activeTab, setActiveTab] = useState<SubTab>('regular');
    const [scheduleView, setScheduleView] = useState<'all' | 'unplayed'>('all');
    const [currentRound, setCurrentRound] = useState(1);

    const accentColor = tournament === 'clausura' ? '#C084FC' : '#4FC3F7';

    const tournamentMatches = useMemo(() =>
        matches.filter(m => m.tournament === tournament).sort((a, b) => Number(a.id) - Number(b.id)),
        [matches, tournament]);

    const displayedMatches = useMemo(() =>
        scheduleView === 'all' ? tournamentMatches : tournamentMatches.filter(m => !m.isPlayed),
        [tournamentMatches, scheduleView]);

    const standings = useMemo(() => getStandings(tournament), [matches, tournament]);

    const qualifiedTeams = { A: standings.A.slice(0, 8), B: standings.B.slice(0, 8) };

    const handleSimulateNextRound = () => {
        const unplayed = matches.filter(m => m.tournament === tournament && !m.isPlayed);
        if (unplayed.length > 0) {
            const nextR = Math.min(...unplayed.map(m => m.round));
            simulateNextRound(tournament);
            setCurrentRound(nextR);
        }
    };

    const canStartPlayoffs = useMemo(() =>
        tournamentMatches.length > 0 && tournamentMatches.every(m => m.isPlayed),
        [tournamentMatches]);

    const tabs: { id: SubTab; label: string; icon: React.ReactNode }[] = [
        { id: 'regular', label: 'Fase Regular', icon: <LayoutGrid size={14} /> },
        { id: 'playoffs', label: 'Playoffs', icon: <Trophy size={14} /> },
        { id: 'scorers', label: 'Estadísticas', icon: <Medal size={14} /> },
        { id: 'proyecciones', label: 'Proyecciones', icon: <BarChart3 size={14} /> },
        { id: 'simulacion', label: 'Simulación', icon: <Radio size={14} /> },
        { id: 'envivo', label: 'En Vivo', icon: <Tv size={14} /> },
    ];

    return (
        <div className="space-y-4">
            {/* Sub-tab navigation */}
            <div className="flex flex-wrap gap-1 p-1 rounded-xl border theme-fade"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                {tabs.map(({ id, label, icon }) => {
                    const active = activeTab === id;
                    return (
                        <button key={id}
                            onClick={() => setActiveTab(id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-all"
                            style={active
                                ? { background: `${accentColor}15`, color: accentColor, boxShadow: `inset 0 -2px 0 ${accentColor}` }
                                : { color: 'var(--text-muted)' }
                            }>
                            {icon}{label}
                        </button>
                    );
                })}
            </div>

            {/* Simulation controls */}
            {(activeTab === 'regular' || activeTab === 'scorers') && (
                <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => simulateMatch(tournament)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold transition-all hover:scale-[1.02]"
                        style={{
                            background: `${accentColor}10`,
                            borderColor: `${accentColor}30`,
                            color: accentColor
                        }}>
                        <PlayCircle size={14} /> Simular Partido
                    </button>
                    <button onClick={handleSimulateNextRound}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold transition-all hover:scale-[1.02]"
                        style={{
                            background: `${accentColor}10`,
                            borderColor: `${accentColor}30`,
                            color: accentColor
                        }}>
                        <FastForward size={14} /> Simular Fecha
                    </button>
                    <button onClick={() => simulateAll(tournament)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold transition-all hover:scale-[1.02]"
                        style={{
                            background: `${accentColor}10`,
                            borderColor: `${accentColor}30`,
                            color: accentColor
                        }}>
                        <FastForward size={14} /> Simular Todo
                    </button>
                    <button onClick={() => resetTournament()}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold transition-all hover:scale-[1.02]"
                        style={{
                            background: 'var(--surface)',
                            borderColor: 'var(--border)',
                            color: 'var(--text-muted)'
                        }}>
                        <RotateCcw size={14} /> Reiniciar
                    </button>
                    <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: 'var(--surface-2)' }}>
                        {(['all', 'unplayed'] as const).map(v => (
                            <button key={v} onClick={() => setScheduleView(v)}
                                className="px-2.5 py-1 rounded-md text-[10px] font-bold transition-all"
                                style={scheduleView === v
                                    ? { background: accentColor, color: 'white' }
                                    : { color: 'var(--text-faint)' }
                                }>
                                {v === 'all' ? 'Todos' : 'Pendientes'}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Content area */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                {activeTab === 'regular' && (
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                        <div className="xl:col-span-2 space-y-4">
                            <StandingsTable
                                zoneName="Zona A"
                                teams={standings.A}
                                theme={tournament === 'clausura' ? 'purple' : 'blue'}
                            />
                            <StandingsTable
                                zoneName="Zona B"
                                teams={standings.B}
                                theme={tournament === 'clausura' ? 'purple' : 'blue'}
                            />
                        </div>
                        <div>
                            <MatchList
                                matches={displayedMatches}
                                teams={teams}
                                initialRound={currentRound}
                                onRoundChange={setCurrentRound}
                                onSimulate={(matchId) => simulateMatch(matchId)}
                                theme={tournament === 'clausura' ? 'purple' : 'blue'}
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'playoffs' && (
                    <PlayoffBracket
                        qualifiedTeams={qualifiedTeams}
                        theme={tournament === 'clausura' ? 'purple' : 'blue'}
                    />
                )}

                {activeTab === 'scorers' && (
                    <TopScorers teams={teams} />
                )}

                {activeTab === 'proyecciones' && (
                    <ProbabilityPanel
                        teams={teams}
                        matches={matches}
                        tournament={tournament}
                    />
                )}

                {activeTab === 'simulacion' && (
                    <EnVivo
                        teams={teams}
                        matches={matches}
                        tournament={tournament}
                        currentRound={currentRound}
                        onMatchesUpdate={bulkUpdateMatches}
                    />
                )}

                {activeTab === 'envivo' && (
                    <PartidosEnVivo
                        accentColor={accentColor}
                        onSync={syncMatchesWithRealData}
                    />
                )}
            </div>
        </div>
    );
}
