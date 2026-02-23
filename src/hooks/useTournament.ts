import { useState, useEffect } from 'react';
import { TEAMS } from '@/lib/data/teams';
import type { Team, Match } from '@/lib/types';
import OFFICIAL_FIXTURE from '@/lib/data/official_fixture.json';

export const useTournament = () => {
    // ... (logic explanation)

    const [teams, setTeams] = useState<Team[]>(TEAMS);
    const [matches, setMatches] = useState<Match[]>([]);

    // Initialize/Load Data
    useEffect(() => {
        const storedTeamsRaw = localStorage.getItem('tournament_teams_v3');
        const storedMatchesRaw = localStorage.getItem('tournament_matches_v3');

        if (storedTeamsRaw && storedMatchesRaw) {
            const storedMatches = JSON.parse(storedMatchesRaw);
            const storedTeams: Team[] = JSON.parse(storedTeamsRaw);

            // Merge with TEAMS to get new fields like apiId without losing current stats
            const mergedTeams = storedTeams.map(st => {
                const sourceTeam = TEAMS.find(t => t.id === st.id);
                return {
                    ...st,
                    apiId: sourceTeam?.apiId ?? st.apiId
                };
            });

            setTeams(mergedTeams);
            setMatches(storedMatches);
        } else {
            // Use Official Fixture
            setMatches(OFFICIAL_FIXTURE as Match[]);
            setTeams(TEAMS);
        }
    }, []);

    // Persistence
    useEffect(() => {
        if (matches.length > 0) {
            localStorage.setItem('tournament_teams_v3', JSON.stringify(teams));
            localStorage.setItem('tournament_matches_v3', JSON.stringify(matches));
        }
    }, [teams, matches]);

    // --- Simulation Logic ---

    const distributeStats = (team: Team, goalsCount: number): Team => {
        const newTeam = { ...team, players: team.players.map(p => ({ ...p })) };

        // 1. All players "play" the match (increment matchesPlayed)
        // In a real sim we'd pick 11-16 players, but simple works for now
        newTeam.players.forEach(p => p.matchesPlayed += 1);

        // 2. Distribute Goals
        const scorers = newTeam.players.filter(p => p.position === 'FWD' || p.position === 'MID' || p.position === 'DEF');
        for (let i = 0; i < goalsCount; i++) {
            if (scorers.length > 0) {
                // Bias towards forwards
                const weights = scorers.map(p => p.position === 'FWD' ? 5 : p.position === 'MID' ? 2 : 1);
                const totalWeight = weights.reduce((a, b) => a + b, 0);
                let r = Math.random() * totalWeight;
                let foundIdx = 0;
                for (let j = 0; j < scorers.length; j++) {
                    r -= weights[j];
                    if (r <= 0) { foundIdx = j; break; }
                }
                scorers[foundIdx].goals += 1;

                // 3. Potential Assist (70% chance per goal)
                if (Math.random() < 0.7) {
                    const assisters = newTeam.players.filter(p => p.id !== scorers[foundIdx].id && (p.position === 'MID' || p.position === 'FWD' || p.position === 'DEF'));
                    if (assisters.length > 0) {
                        const randomAssister = assisters[Math.floor(Math.random() * assisters.length)];
                        randomAssister.assists += 1;
                    }
                }
            }
        }

        // 4. Yellow Cards (0-3 per team per match)
        const yellowCount = Math.floor(Math.random() * 4);
        for (let i = 0; i < yellowCount; i++) {
            const p = newTeam.players[Math.floor(Math.random() * newTeam.players.length)];
            p.yellowCards += 1;
        }

        // 5. Red Cards (5% chance per match)
        if (Math.random() < 0.05) {
            const p = newTeam.players[Math.floor(Math.random() * newTeam.players.length)];
            p.redCards += 1;
        }

        return newTeam;
    };

    const simulateMatch = (matchId: string) => {
        const matchIndex = matches.findIndex(m => m.id === matchId);
        if (matchIndex === -1) return;

        const match = matches[matchIndex];
        if (match.isPlayed) return;

        // Generate scores
        const homeScore = Math.floor(Math.random() * 4); // 0-3
        let awayScore = Math.floor(Math.random() * 3); // 0-2

        // Home advantage slight boost? NA

        const updatedMatch = {
            ...match,
            homeScore,
            awayScore,
            isPlayed: true
        };

        const newMatches = [...matches];
        newMatches[matchIndex] = updatedMatch;
        setMatches(newMatches);

        // Update Player Goals (We update the global 'teams' state for player stats only)
        // We DON'T update team points/GF/GC in 'teams' state anymore, we calculate it dynamically.
        // BUT we DO update player goals.
        setTeams(prevTeams => {
            const homeTeam = prevTeams.find(t => t.id === match.homeTeamId);
            const awayTeam = prevTeams.find(t => t.id === match.awayTeamId);

            if (!homeTeam || !awayTeam) return prevTeams;

            const newHome = distributeStats(homeTeam, homeScore);
            const newAway = distributeStats(awayTeam, awayScore);

            return prevTeams.map(t => {
                if (t.id === newHome.id) return newHome;
                if (t.id === newAway.id) return newAway;
                return t;
            });
        });
    };

    const simulateNextRound = (tournament?: 'apertura' | 'clausura') => {
        const activeTournament = tournament || 'apertura';

        // Find the lowest round number that has unplayed matches in this tournament
        const unplayedMatches = matches.filter(m => m.tournament === activeTournament && !m.isPlayed);
        if (unplayedMatches.length === 0) return;

        const nextRound = Math.min(...unplayedMatches.map(m => m.round));
        const matchesToSimulate = matches.filter(m => m.tournament === activeTournament && m.round === nextRound && !m.isPlayed);

        const newMatches = [...matches];
        let tempTeams = [...teams];

        matchesToSimulate.forEach(match => {
            const index = newMatches.findIndex(m => m.id === match.id);
            if (index !== -1) {
                const homeScore = Math.floor(Math.random() * 4);
                const awayScore = Math.floor(Math.random() * 3);

                newMatches[index] = { ...match, homeScore, awayScore, isPlayed: true };

                const homeTeamIdx = tempTeams.findIndex(t => t.id === match.homeTeamId);
                const awayTeamIdx = tempTeams.findIndex(t => t.id === match.awayTeamId);

                if (homeTeamIdx !== -1 && awayTeamIdx !== -1) {
                    tempTeams[homeTeamIdx] = distributeStats(tempTeams[homeTeamIdx], homeScore);
                    tempTeams[awayTeamIdx] = distributeStats(tempTeams[awayTeamIdx], awayScore);
                }
            }
        });

        setMatches(newMatches);
        setTeams(tempTeams);
    };

    const simulateAll = (tournament?: 'apertura' | 'clausura') => {
        // Find unplayed matches
        // We need to do this carefully to avoid state batching issues if we iterate.
        // Better to generate all results first.

        const newMatches = [...matches];
        let tempTeams = [...teams];

        newMatches.forEach((match, index) => {
            // Filter by tournament if specified
            if (tournament && match.tournament !== tournament) return;

            if (!match.isPlayed) {
                const homeScore = Math.floor(Math.random() * 4);
                const awayScore = Math.floor(Math.random() * 3);

                newMatches[index] = { ...match, homeScore, awayScore, isPlayed: true };

                // Update player goals in tempTeams
                const homeTeamIdx = tempTeams.findIndex(t => t.id === match.homeTeamId);
                const awayTeamIdx = tempTeams.findIndex(t => t.id === match.awayTeamId);

                if (homeTeamIdx !== -1 && awayTeamIdx !== -1) {
                    tempTeams[homeTeamIdx] = distributeStats(tempTeams[homeTeamIdx], homeScore);
                    tempTeams[awayTeamIdx] = distributeStats(tempTeams[awayTeamIdx], awayScore);
                }
            }
        });

        setMatches(newMatches);
        setTeams(tempTeams);
    };

    const resetTournament = () => {
        localStorage.removeItem('tournament_teams_v3');
        localStorage.removeItem('tournament_matches_v3');
        window.location.reload();
    };

    // --- Sync with Real API Results ---
    const syncMatchesWithRealData = (realFixtures: any[]) => {
        let hasChanges = false;
        const newMatches = matches.map(m => {
            if (m.isPlayed) return m;

            // Find internal teams to get their apiIds
            const homeTeam = teams.find(t => t.id === m.homeTeamId);
            const awayTeam = teams.find(t => t.id === m.awayTeamId);

            if (!homeTeam?.apiId || !awayTeam?.apiId) return m;

            // Find real fixture matching these apiIds
            const realFixture = realFixtures.find(rf => {
                // Handle different potential structures (direct response from API-Football vs our transformed response)
                const rfHomeId = rf.teams?.home?.id ?? rf.home?.id;
                const rfAwayId = rf.teams?.away?.id ?? rf.away?.id;
                return rfHomeId === homeTeam.apiId && rfAwayId === awayTeam.apiId;
            });

            if (realFixture) {
                const status = realFixture.fixture?.status?.short || realFixture.statusShort;
                const isFinished = status === 'FT' || status === 'AET' || status === 'PEN';

                if (isFinished) {
                    const hScore = realFixture.goals?.home ?? realFixture.score?.home ?? (realFixture.goals && realFixture.goals.home);
                    const aScore = realFixture.goals?.away ?? realFixture.score?.away ?? (realFixture.goals && realFixture.goals.away);

                    if (hScore !== undefined && aScore !== undefined && hScore !== null && aScore !== null) {
                        hasChanges = true;
                        return { ...m, homeScore: hScore, awayScore: aScore, isPlayed: true };
                    }
                }
            }
            return m;
        });

        if (hasChanges) {
            setMatches(newMatches);
        }
    };

    // --- Manual Update ---
    const updateMatch = (id: string, homeScore: number | null, awayScore: number | null) => {
        // This is for manual input. Logic is similar but cleaner to just update match.
        // Player goals won't be auto-distributed for manual input (complexity limitation).
        setMatches(prev => prev.map(m =>
            m.id === id ? { ...m, homeScore, awayScore, isPlayed: homeScore !== null && awayScore !== null } : m
        ));
    };

    // --- Bulk Update (for live simulation) ---
    const bulkUpdateMatches = (updatedMatches: Match[]) => {
        setMatches(updatedMatches);
    };


    // --- Dynamic Standings Calculation ---
    const getStandings = (tournament: 'apertura' | 'clausura') => {
        // Start with clean stats for all teams
        const currentStatsMap: Record<string, Team['stats']> = {};
        const currentStreaksMap: Record<string, Team['streaks']> = {};
        const homeStatsMap: Record<string, Team['stats']> = {};
        const awayStatsMap: Record<string, Team['stats']> = {};
        const formMap: Record<string, string[]> = {};

        teams.forEach(t => {
            currentStatsMap[t.id] = { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, gc: 0, pts: 0, goalDiff: 0 };
            currentStreaksMap[t.id] = { win: 0, unbeaten: 0, loss: 0 };
            homeStatsMap[t.id] = { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, gc: 0, pts: 0, goalDiff: 0 };
            awayStatsMap[t.id] = { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, gc: 0, pts: 0, goalDiff: 0 };
            formMap[t.id] = [];
        });

        const relevantMatches = matches.filter(m => m.tournament === tournament && m.isPlayed)
            .sort((a, b) => a.round - b.round);

        relevantMatches.forEach(m => {
            if (m.homeScore === null || m.awayScore === null) return;

            const homeId = m.homeTeamId;
            const awayId = m.awayTeamId;

            // Update Home
            const h = currentStatsMap[homeId];
            const hs = currentStreaksMap[homeId];
            const hh = homeStatsMap[homeId];
            if (h && hs && hh) {
                h.played++; hh.played++;
                h.gf += m.homeScore; hh.gf += m.homeScore;
                h.gc += m.awayScore; hh.gc += m.awayScore;
                h.goalDiff = h.gf - h.gc; hh.goalDiff = hh.gf - hh.gc;

                if (m.homeScore > m.awayScore) {
                    h.won++; hh.won++; h.pts += 3; hh.pts += 3;
                    hs.win++; hs.unbeaten++; hs.loss = 0;
                    formMap[homeId].push('W');
                }
                else if (m.homeScore === m.awayScore) {
                    h.drawn++; hh.drawn++; h.pts += 1; hh.pts += 1;
                    hs.win = 0; hs.unbeaten++; hs.loss = 0;
                    formMap[homeId].push('D');
                }
                else {
                    h.lost++; hh.lost++;
                    hs.win = 0; hs.unbeaten = 0; hs.loss++;
                    formMap[homeId].push('L');
                }
                if (formMap[homeId].length > 5) formMap[homeId].shift();
            }

            // Update Away
            const a = currentStatsMap[awayId];
            const as = currentStreaksMap[awayId];
            const aa = awayStatsMap[awayId];
            if (a && as && aa) {
                a.played++; aa.played++;
                a.gf += m.awayScore; aa.gf += m.awayScore;
                a.gc += m.homeScore; aa.gc += m.homeScore;
                a.goalDiff = a.gf - a.gc; aa.goalDiff = aa.gf - aa.gc;

                if (m.awayScore > m.homeScore) {
                    a.won++; aa.won++; a.pts += 3; aa.pts += 3;
                    as.win++; as.unbeaten++; as.loss = 0;
                    formMap[awayId].push('W');
                }
                else if (m.awayScore === m.homeScore) {
                    a.drawn++; aa.drawn++; a.pts += 1; aa.pts += 1;
                    as.win = 0; as.unbeaten++; as.loss = 0;
                    formMap[awayId].push('D');
                }
                else {
                    a.lost++; aa.lost++;
                    as.win = 0; as.unbeaten = 0; as.loss++;
                    formMap[awayId].push('L');
                }
                if (formMap[awayId].length > 5) formMap[awayId].shift();
            }
        });

        // Calculate Position History (Rank within zone per round)
        const maxRoundPlayed = relevantMatches.length > 0 ? Math.max(...relevantMatches.map(m => m.round)) : 0;
        const positionHistoryMap: Record<string, number[]> = {};
        teams.forEach(t => positionHistoryMap[t.id] = []);

        for (let r = 1; r <= maxRoundPlayed; r++) {
            const tempStats: Record<string, { pts: number, gd: number, gf: number }> = {};
            teams.forEach(t => tempStats[t.id] = { pts: 0, gd: 0, gf: 0 });

            relevantMatches.filter(m => m.round <= r).forEach(m => {
                const h = tempStats[m.homeTeamId];
                const a = tempStats[m.awayTeamId];
                if (!h || !a) return;
                h.gf += m.homeScore!; h.gd += (m.homeScore! - m.awayScore!);
                a.gf += m.awayScore!; a.gd += (m.awayScore! - m.homeScore!);
                if (m.homeScore! > m.awayScore!) h.pts += 3;
                else if (m.homeScore === m.awayScore) { h.pts += 1; a.pts += 1; }
                else a.pts += 3;
            });

            // Calculate ranks per zone
            ['A', 'B'].forEach(zone => {
                const zoneTeams = teams.filter(t => t.zone === zone)
                    .map(t => ({ id: t.id, ...tempStats[t.id] }))
                    .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);

                zoneTeams.forEach((team, index) => {
                    positionHistoryMap[team.id].push(index + 1);
                });
            });
        }

        // Return teams with computed stats
        const computedTeams = teams.map(t => ({
            ...t,
            stats: currentStatsMap[t.id] || t.stats,
            streaks: currentStreaksMap[t.id] || t.streaks,
            form: formMap[t.id] || [],
            homeStats: homeStatsMap[t.id] || t.stats,
            awayStats: awayStatsMap[t.id] || t.stats,
            positionHistory: positionHistoryMap[t.id] || []
        }));

        const zoneA = computedTeams.filter(t => t.zone === 'A').sort((a, b) => b.stats.pts - a.stats.pts || b.stats.goalDiff - a.stats.goalDiff);
        const zoneB = computedTeams.filter(t => t.zone === 'B').sort((a, b) => b.stats.pts - a.stats.pts || b.stats.goalDiff - a.stats.goalDiff);

        return { A: zoneA, B: zoneB, all: computedTeams };
    };

    // --- Promedios Calculation Helper ---
    // Returns teams with stats reflecting Apertura + Clausura
    const getCombinedStats = () => {
        // Similar to above but filters ALL matches
        const currentStatsMap: Record<string, Team['stats']> = {};
        teams.forEach(t => {
            currentStatsMap[t.id] = {
                played: 0, won: 0, drawn: 0, lost: 0, gf: 0, gc: 0, pts: 0, goalDiff: 0
            };
        });

        const playedMatches = matches.filter(m => m.isPlayed);

        playedMatches.forEach(m => {
            if (m.homeScore === null || m.awayScore === null) return;
            // ... duplicate logic, could be extracted
            const homeId = m.homeTeamId; const awayId = m.awayTeamId;
            const h = currentStatsMap[homeId];
            if (h) {
                h.played++; h.gf += m.homeScore; h.gc += m.awayScore; h.goalDiff = h.gf - h.gc;
                if (m.homeScore > m.awayScore) { h.pts += 3; } else if (m.homeScore === m.awayScore) { h.pts += 1; }
            }
            const a = currentStatsMap[awayId];
            if (a) {
                a.played++; a.gf += m.awayScore; a.gc += m.homeScore; a.goalDiff = a.gf - a.gc;
                if (m.awayScore > m.homeScore) { a.pts += 3; } else if (m.awayScore === m.homeScore) { a.pts += 1; }
            }
        });

        return teams.map(t => ({
            ...t,
            stats: currentStatsMap[t.id],
            streaks: { win: 0, unbeaten: 0, loss: 0 },
            form: [],
            homeStats: currentStatsMap[t.id],
            awayStats: currentStatsMap[t.id],
            positionHistory: []
        }));
    };

    return {
        teams, // Raw teams (with player goal data)
        matches, // All matches
        simulateMatch,
        simulateNextRound,
        simulateAll,
        resetTournament,
        updateMatch,
        bulkUpdateMatches,
        syncMatchesWithRealData,
        getStandings,
        getCombinedStats
    };
};

