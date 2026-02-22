import { useState, useMemo } from 'react';
import { useTournament } from './hooks/useTournament';
import { StandingsTable } from './components/StandingsTable';
import { MatchList } from './components/MatchList';
import { PlayoffBracket } from './components/PlayoffBracket';
import { TopScorers } from './components/TopScorers';
import { LayoutGrid, Trophy, PlayCircle, FastForward, RotateCcw, Medal, ArrowRightLeft } from 'lucide-react';
import { PromediosTable } from './components/PromediosTable';
import { TeamsView } from './components/TeamsView';
import { AnnualTable } from './components/AnnualTable';
import clsx from 'clsx';


function App() {
  const {
    teams, matches,
    simulateMatch, simulateAll, resetTournament,
    getStandings, getCombinedStats
  } = useTournament();

  // Top level state
  type MainView = 'apertura' | 'clausura' | 'annual' | 'promedios' | 'equipos';
  const [mainView, setMainView] = useState<MainView>('apertura');
  const [activeTab, setActiveTab] = useState<'regular' | 'playoffs' | 'scorers'>('regular');
  const [scheduleView, setScheduleView] = useState<'all' | 'unplayed'>('all');

  // Derived Data based on Active Tournament (Defaults to Apertura if in Annual/Promedios view for some calcs, but mainly used for Apertura/Clausura views)
  const activeTournament = (mainView === 'apertura' || mainView === 'clausura') ? mainView : 'apertura';

  const currentTournamentMatches = useMemo(() =>
    matches.filter(m => m.tournament === activeTournament).sort((a, b) => Number(a.id) - Number(b.id)),
    [matches, activeTournament]);

  const displayedMatches = useMemo(() =>
    scheduleView === 'all'
      ? currentTournamentMatches
      : currentTournamentMatches.filter(m => !m.isPlayed),
    [currentTournamentMatches, scheduleView]);

  const standings = useMemo(() => getStandings(activeTournament), [matches, activeTournament]);

  const canStartPlayoffs = useMemo(() =>
    currentTournamentMatches.length > 0 && currentTournamentMatches.every(m => m.isPlayed),
    [currentTournamentMatches]);

  const qualifiedTeams = {
    A: standings.A.slice(0, 8),
    B: standings.B.slice(0, 8)
  };

  // Promedios Data (Combined)
  const promediosTeams = useMemo(() => getCombinedStats(), [matches]);

  return (
    <div className="min-h-screen bg-background text-zinc-100 p-4 md:p-8 font-sans">
      <header className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-primary to-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
            <Trophy className="text-white" size={24} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tight text-white uppercase flex items-center gap-2">
              Liga Profesional 2026
            </h1>
            <span className="text-zinc-400 text-sm font-medium">Primera División de Argentina</span>
          </div>
        </div>

        {/* Tournament Switcher */}
        <div className="flex p-1 bg-surface rounded-lg border border-white/5 gap-1">
          <button
            onClick={() => { setMainView('equipos'); }}
            className={clsx(
              "px-4 py-2 rounded-md text-sm font-bold transition-all uppercase tracking-wide",
              mainView === 'equipos' ? "bg-zinc-700 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
            )}
          >
            Equipos
          </button>
          <button
            onClick={() => { setMainView('apertura'); setActiveTab('regular'); }}
            className={clsx(
              "px-4 py-2 rounded-md text-sm font-bold transition-all uppercase tracking-wide",
              mainView === 'apertura' ? "bg-primary text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
            )}
          >
            Apertura
          </button>
          <button
            onClick={() => { setMainView('clausura'); setActiveTab('regular'); }}
            className={clsx(
              "px-4 py-2 rounded-md text-sm font-bold transition-all uppercase tracking-wide",
              mainView === 'clausura' ? "bg-purple-600 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
            )}
          >
            Clausura
          </button>
          <button
            onClick={() => setMainView('annual')}
            className={clsx(
              "px-4 py-2 rounded-md text-sm font-bold transition-all uppercase tracking-wide flex items-center gap-2",
              mainView === 'annual' ? "bg-indigo-600 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
            )}
          >
            <Trophy size={14} />
            Tabla Anual
          </button>
          <button
            onClick={() => setMainView('promedios')}
            className={clsx(
              "px-4 py-2 rounded-md text-sm font-bold transition-all uppercase tracking-wide flex items-center gap-2",
              mainView === 'promedios' ? "bg-rose-600 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
            )}
          >
            <ArrowRightLeft size={14} />
            Promedios
          </button>
        </div>
      </header>

      {/* Tabs (Hidden if Annual or Promedios View) */}
      {(mainView === 'apertura' || mainView === 'clausura') && (
        <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2 bg-surface p-1 rounded-lg border border-white/5">
            <button
              onClick={() => setActiveTab('regular')}
              className={clsx(
                "px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2",
                activeTab === 'regular'
                  ? (mainView === 'clausura' ? "bg-purple-600 text-white shadow-lg shadow-purple-900/20" : "bg-blue-600 text-white shadow-lg shadow-blue-900/20")
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
              )}
            >
              <LayoutGrid size={16} />
              Fase Regular
            </button>
            <button
              onClick={() => setActiveTab('playoffs')}
              className={clsx(
                "px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2",
                activeTab === 'playoffs'
                  ? (mainView === 'clausura' ? "bg-purple-600 text-white shadow-lg shadow-purple-900/20" : "bg-blue-600 text-white shadow-lg shadow-blue-900/20")
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
              )}
            >
              <Trophy size={16} />
              Playoffs
            </button>
            <button
              onClick={() => setActiveTab('scorers')}
              className={clsx(
                "px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2",
                activeTab === 'scorers'
                  ? (mainView === 'clausura' ? "bg-purple-600 text-white shadow-lg shadow-purple-900/20" : "bg-blue-600 text-white shadow-lg shadow-blue-900/20")
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
              )}
            >
              <Medal size={16} />
              Goleadores
            </button>
          </div>

          {/* RESET / SIMULATE buttons */}
          <div className="flex gap-2">
            <button onClick={resetTournament} className="p-2 hover:bg-white/5 rounded-full text-zinc-500 transition-colors" title="Reset Total">
              <RotateCcw size={20} />
            </button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto space-y-8">

        {/* --- REGULAR PHASE --- */}
        {(mainView === 'apertura' || mainView === 'clausura') && activeTab === 'regular' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Sim Controls */}
            <div className="flex justify-between items-center bg-surface p-4 rounded-xl border border-white/5">
              <div className="flex items-center gap-4">
                <span className="text-zinc-400 text-sm font-bold uppercase">{mainView} 2026</span>
                <select
                  className="bg-black/30 text-sm rounded-md px-3 py-1.5 border border-white/10 outline-none focus:border-primary/50"
                  value={scheduleView}
                  onChange={(e) => setScheduleView(e.target.value as any)}
                >
                  <option value="all">Ver Todos</option>
                  <option value="unplayed">Solo Pendientes</option>
                </select>
              </div>
              <button
                onClick={() => simulateAll(mainView as 'apertura' | 'clausura')}
                className={clsx(
                  "px-6 py-2 text-white rounded-lg text-sm font-bold transition-all shadow-lg flex items-center gap-2",
                  mainView === 'apertura'
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 shadow-blue-900/30"
                    : "bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 shadow-purple-900/30"
                )}
              >
                <FastForward size={16} />
                Simular Todo ({mainView})
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <StandingsTable zoneName="Zona A" teams={standings.A} theme={mainView === 'clausura' ? 'purple' : 'blue'} />
              <StandingsTable zoneName="Zona B" teams={standings.B} theme={mainView === 'clausura' ? 'purple' : 'blue'} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <PlayCircle className="text-primary" size={20} />
                Fixture {mainView}
              </h2>
              <MatchList
                matches={displayedMatches}
                teams={teams}
                onSimulate={simulateMatch}
                onSimulateRest={() => { }}
                theme={mainView === 'clausura' ? 'purple' : 'blue'}
              />
            </div>
          </div>
        )}

        {/* --- PLAYOFFS --- */}
        {(mainView === 'apertura' || mainView === 'clausura') && activeTab === 'playoffs' && (
          <div className="animate-in fade-in zoom-in duration-300">
            {!canStartPlayoffs ? (
              <div className="text-center py-20 bg-surface rounded-xl border border-white/5 border-dashed">
                <Trophy className="mx-auto text-zinc-600 mb-4" size={48} />
                <h3 className="text-xl font-bold text-zinc-400">Playoffs no disponibles</h3>
                <p className="text-zinc-500">Debes completar todos los partidos de la Fase Regular del {mainView} primero.</p>
              </div>
            ) : (
              <div className="bg-surface p-6 rounded-xl border border-white/5 overflow-x-auto">
                <h2 className="text-xl font-bold text-center mb-8 text-accent/80 tracking-widest uppercase">Fase Final - {mainView}</h2>
                <PlayoffBracket
                  qualifiedTeams={qualifiedTeams}
                  theme={mainView === 'clausura' ? 'purple' : 'blue'}
                />
              </div>
            )}
          </div>
        )}

        {/* --- SCORERS --- */}
        {(mainView === 'apertura' || mainView === 'clausura') && activeTab === 'scorers' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <TopScorers
              teams={teams}
              theme={mainView === 'clausura' ? 'purple' : 'blue'}
            />
            <p className="text-center text-zinc-500 text-xs mt-4">* Goleadores acumulados de la temporada.</p>
          </div>
        )}

        {/* --- TEAMS VIEW --- */}
        {mainView === 'equipos' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <TeamsView teams={teams} />
          </div>
        )}

        {/* --- ANNUAL TABLE --- */}
        {mainView === 'annual' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <AnnualTable teams={promediosTeams} />
          </div>
        )}

        {/* --- PROMEDIOS --- */}
        {mainView === 'promedios' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <PromediosTable teams={promediosTeams} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
