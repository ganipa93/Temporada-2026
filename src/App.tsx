import { useState, useMemo, useEffect } from 'react';
import { useTournament } from './hooks/useTournament';
import { StandingsTable } from './components/StandingsTable';
import { MatchList } from './components/MatchList';
import { PlayoffBracket } from './components/PlayoffBracket';
import { TopScorers } from './components/TopScorers';
import { ProbabilityPanel } from './components/ProbabilityPanel';
import { EnVivo } from './components/EnVivo';
import { PartidosEnVivo } from './components/PartidosEnVivo';
import { LayoutGrid, Trophy, PlayCircle, FastForward, RotateCcw, Medal, ArrowRightLeft, Sun, Moon, BarChart3, Radio, Tv } from 'lucide-react';
import { PromediosTable } from './components/PromediosTable';
import { TeamsView } from './components/TeamsView';
import { AnnualTable } from './components/AnnualTable';



function App() {
  const {
    teams, matches,
    simulateMatch, simulateNextRound, simulateAll, resetTournament,
    getStandings, getCombinedStats, bulkUpdateMatches
  } = useTournament();

  // Top level state
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') !== 'light');

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.add('light');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  type MainView = 'apertura' | 'clausura' | 'annual' | 'promedios' | 'equipos';
  const [mainView, setMainView] = useState<MainView>('apertura');
  const [activeTab, setActiveTab] = useState<'regular' | 'playoffs' | 'scorers' | 'proyecciones' | 'simulacion' | 'envivo'>('regular');
  const [scheduleView, setScheduleView] = useState<'all' | 'unplayed'>('all');
  const [currentRound, setCurrentRound] = useState(1);

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

  const qualifiedTeams = {
    A: standings.A.slice(0, 8),
    B: standings.B.slice(0, 8)
  };

  const handleSimulateNextRound = () => {
    // Find next unplayed round to sync the view
    const unplayed = matches.filter(m => m.tournament === activeTournament && !m.isPlayed);
    if (unplayed.length > 0) {
      const nextR = Math.min(...unplayed.map(m => m.round));
      simulateNextRound(activeTournament);
      setCurrentRound(nextR);
    }
  };

  const canStartPlayoffs = useMemo(() =>
    currentTournamentMatches.length > 0 && currentTournamentMatches.every(m => m.isPlayed),
    [currentTournamentMatches]);

  // Promedios Data (Combined)
  const promediosTeams = useMemo(() => getCombinedStats(), [matches]);

  return (
    <div className="min-h-screen font-sans theme-fade" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Top stripe */}
      <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #4FC3F7 0%, #007ACC 50%, #C084FC 100%)' }} />
      <header className="max-w-7xl mx-auto px-3 md:px-6 py-3 md:py-4 flex flex-wrap items-center justify-between gap-3">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl shadow-lg flex-shrink-0" style={{ background: 'var(--accent-dim)', border: '1px solid var(--border-strong)' }}>
            <Trophy style={{ color: 'var(--accent)' }} size={22} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg md:text-2xl font-black tracking-tight uppercase leading-tight" style={{ color: 'var(--text)' }}>
              Liga Profesional 2026
            </h1>
            <span className="text-xs md:text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Primera División de Argentina</span>
          </div>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setIsDark(d => !d)}
          className="p-2 rounded-xl border transition-all hover:scale-105 flex-shrink-0"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border-strong)',
            color: isDark ? '#FBBF24' : '#007ACC'
          }}
          title={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Tournament Switcher */}
        <nav className="flex flex-wrap p-1 gap-1 rounded-xl border theme-fade"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          {[
            { id: 'equipos', label: 'Equipos', icon: null, color: '#64748B' },
            { id: 'apertura', label: 'Apertura', icon: null, color: '#4FC3F7' },
            { id: 'clausura', label: 'Clausura', icon: null, color: '#C084FC' },
            { id: 'annual', label: 'Anual', icon: <Trophy size={13} />, color: '#FBBF24' },
            { id: 'promedios', label: 'Promedios', icon: <ArrowRightLeft size={13} />, color: '#F87171' },
          ].map(({ id, label, icon, color }) => {
            const active = mainView === id;
            return (
              <button
                key={id}
                onClick={() => { setMainView(id as any); if (id === 'apertura' || id === 'clausura') setActiveTab('regular'); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all"
                style={active
                  ? { background: color, color: id === 'annual' ? '#1A1A1A' : 'white', boxShadow: `0 2px 10px ${color}40` }
                  : { color: 'var(--text-muted)' }
                }
              >
                {icon}{label}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Main Content Wrapper */}
      <main className="max-w-7xl mx-auto px-3 md:px-6 pb-10">
        {/* Tabs */}
        {(mainView === 'apertura' || mainView === 'clausura') && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1 p-1 rounded-xl border theme-fade"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              {[
                { id: 'regular', label: 'Fase Regular', icon: <LayoutGrid size={14} /> },
                { id: 'playoffs', label: 'Playoffs', icon: <Trophy size={14} /> },
                { id: 'scorers', label: 'Estadísticas', icon: <Medal size={14} /> },
                { id: 'proyecciones', label: 'Proyecciones', icon: <BarChart3 size={14} /> },
                { id: 'simulacion', label: 'Simulación', icon: <Radio size={14} /> },
                { id: 'envivo', label: 'En Vivo', icon: <Tv size={14} /> },
              ].map(({ id, label, icon }) => {
                const active = activeTab === id;
                const ac = mainView === 'clausura' ? '#C084FC' : '#4FC3F7';
                return (
                  <button key={id} onClick={() => setActiveTab(id as any)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold transition-all"
                    style={active
                      ? { background: ac, color: '#0A1A2F', boxShadow: `0 2px 8px ${ac}50` }
                      : { color: 'var(--text-muted)' }}
                  >
                    {icon}{label}
                  </button>
                );
              })}
            </div>
            {/* Reset */}
            <button onClick={resetTournament}
              className="p-2 rounded-xl border transition-colors"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-faint)' }}
              title="Reset Torneo">
              <RotateCcw size={16} />
            </button>
          </div>
        )}

        {/* --- REGULAR PHASE --- */}
        {(mainView === 'apertura' || mainView === 'clausura') && activeTab === 'regular' && (
          <div className="space-y-6">
            {/* Sim Controls */}
            <div className="card theme-fade flex flex-wrap justify-between items-center p-3 gap-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--accent)' }}>{mainView} 2026</span>
                <select
                  className="text-xs rounded-lg px-2.5 py-1.5 border outline-none theme-fade font-medium"
                  style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  value={scheduleView}
                  onChange={(e) => setScheduleView(e.target.value as any)}
                >
                  <option value="all">Ver Todos</option>
                  <option value="unplayed">Solo Pendientes</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSimulateNextRound}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all"
                  style={{ background: 'var(--surface-2)', borderColor: 'var(--border-strong)', color: 'var(--text)' }}
                >
                  <PlayCircle size={14} style={{ color: 'var(--accent)' }} />
                  Próxima Fecha
                </button>
                <button
                  onClick={() => simulateAll(mainView as 'apertura' | 'clausura')}
                  className="px-4 py-1.5 rounded-lg text-xs font-black text-white flex items-center gap-1.5 transition-all"
                  style={{
                    background: mainView === 'clausura'
                      ? 'linear-gradient(135deg, #9333ea, #c026d3)'
                      : 'linear-gradient(135deg, #4FC3F7, #007ACC)',
                    boxShadow: mainView === 'clausura' ? '0 2px 12px rgba(147,51,234,0.4)' : '0 2px 12px rgba(79,195,247,0.3)'
                  }}
                >
                  <FastForward size={14} />
                  Simular Todo
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <StandingsTable zoneName="Zona A" teams={standings.A} theme={mainView === 'clausura' ? 'purple' : 'blue'} />
              <StandingsTable zoneName="Zona B" teams={standings.B} theme={mainView === 'clausura' ? 'purple' : 'blue'} />
            </div>

            <div>
              <h2 className="text-sm font-black uppercase tracking-widest mb-3 flex items-center gap-2"
                style={{ color: 'var(--text-muted)' }}>
                <PlayCircle style={{ color: 'var(--accent)' }} size={16} />
                Fixture — {mainView} 2026
              </h2>
              <MatchList
                matches={displayedMatches}
                teams={teams}
                onSimulate={simulateMatch}
                onSimulateRest={() => { }}
                initialRound={currentRound}
                onRoundChange={setCurrentRound}
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
              teams={standings.all}
              theme={mainView === 'clausura' ? 'purple' : 'blue'}
            />
            <p className="text-center text-xs mt-4" style={{ color: 'var(--text-faint)' }}>* Goleadores acumulados de la temporada.</p>
          </div>
        )}

        {/* --- PROBABILITY PROJECTIONS --- */}
        {(mainView === 'apertura' || mainView === 'clausura') && activeTab === 'proyecciones' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <ProbabilityPanel
              teams={teams}
              matches={matches}
              tournament={activeTournament}
            />
          </div>
        )}

        {/* --- SIMULACIÓN EN VIVO --- */}
        {(mainView === 'apertura' || mainView === 'clausura') && activeTab === 'simulacion' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <EnVivo
              teams={teams}
              matches={matches}
              tournament={activeTournament}
              currentRound={currentRound}
              onMatchesUpdate={bulkUpdateMatches}
            />
          </div>
        )}

        {/* --- PARTIDOS EN VIVO (API) --- */}
        {(mainView === 'apertura' || mainView === 'clausura') && activeTab === 'envivo' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <PartidosEnVivo
              accentColor={mainView === 'clausura' ? '#C084FC' : '#4FC3F7'}
            />
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
