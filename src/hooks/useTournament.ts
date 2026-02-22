import { useState, useEffect, useMemo } from 'react';
import { TEAMS } from '../data/teams';
import { generateFixtures as generateApertura } from '../utils/scheduler';
import { generateClausuraFixtures } from '../utils/fixtures_clausura';
import type { Team, Match, Zone } from '../types';

export const useTournament = () => {
    // We only keep the static team data. Stats are calculated on fly.
    // However, to maintain the 'player goals' which are currently stored in TEAMS, 
    // we need to either: 
    // 1. Refactor goals to be part of Match events (Too big change)
    // 2. Keep 'teams' state as a "Global Stats" container? No, goals are per tournament usually.
    // Assumption: Player goals in 'Team' object are meaningless if we have 2 tournaments. 
    // BUT, the current goal simulation updates 'teams.players.goals'.
    // Let's create a separate state for "Player Goals" map? 
    // Or just Keep 'teams' state as the source for "Current Player Stats" cumulatively or per tournament?
    // Let's settle on: 'teams' state tracks GLOBAL aggregated stats for simplicity, OR we ignore it.

    // BETTER APPROACH:
    // Maintain `teams` as the initial data.
    // Only derived data matters.
    // BUT, we need to persist "Goals Scored" by players.
    // Let's modify 'simulateMatch' to NOT update teams state directly for stats, BUT update 'player goals'.
    // Actually, let's keep it simple: "Teams" state will accumulate goals for "Goleadores" (Global).

    const [teams, setTeams] = useState<Team[]>(TEAMS);
    const [matches, setMatches] = useState<Match[]>([]);

    // Initialize/Load Data
    useEffect(() => {
        const storedTeams = localStorage.getItem('tournament_teams_v2'); // New version key
        const storedMatches = localStorage.getItem('tournament_matches_v2');

        if (storedTeams && storedMatches) {
            setTeams(JSON.parse(storedTeams));
            setMatches(JSON.parse(storedMatches));
        } else {
            // Generate Both Fixtures
            const aperturaMatches = generateApertura(TEAMS);
            const clausuraMatches = generateClausuraFixtures(TEAMS);
            setMatches([...aperturaMatches, ...clausuraMatches]);
            setTeams(TEAMS);
        }
    }, []);

    // Persistence
    useEffect(() => {
        if (matches.length > 0) {
            localStorage.setItem('tournament_teams_v2', JSON.stringify(teams));
            localStorage.setItem('tournament_matches_v2', JSON.stringify(matches));
        }
    }, [teams, matches]);

    // --- Simulation Logic ---

    const distributeGoals = (team: Team, goalsCount: number): Team => {
        const newTeam = { ...team, players: [...team.players] };

        // Simple random distribution
        // Weighted by position? (FWD > MID > DEF) - For now just random FWD/MID
        const scorers = newTeam.players.filter(p => p.position === 'FWD' || p.position === 'MID');

        for (let i = 0; i < goalsCount; i++) {
            if (scorers.length > 0) {
                const randomPlayer = scorers[Math.floor(Math.random() * scorers.length)];
                randomPlayer.goals += 1; // Mutating clone's player
            }
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

            const newHome = distributeGoals(homeTeam, homeScore);
            const newAway = distributeGoals(awayTeam, awayScore);

            return prevTeams.map(t => {
                if (t.id === newHome.id) return newHome;
                if (t.id === newAway.id) return newAway;
                return t;
            });
        });
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
                    // We need a helper that works on the array directly or keeps cloning
                    // distributeGoals returns a CLONE of the team.
                    tempTeams[homeTeamIdx] = distributeGoals(tempTeams[homeTeamIdx], homeScore);
                    tempTeams[awayTeamIdx] = distributeGoals(tempTeams[awayTeamIdx], awayScore);
                }
            }
        });

        setMatches(newMatches);
        setTeams(tempTeams);
    };

    const resetTournament = () => {
        localStorage.removeItem('tournament_teams_v2');
        localStorage.removeItem('tournament_matches_v2');
        window.location.reload();
    };

    // --- Manual Update ---
    const updateMatch = (id: string, homeScore: number | null, awayScore: number | null) => {
        // This is for manual input. Logic is similar but cleaner to just update match.
        // Player goals won't be auto-distributed for manual input (complexity limitation).
        setMatches(prev => prev.map(m =>
            m.id === id ? { ...m, homeScore, awayScore, isPlayed: homeScore !== null && awayScore !== null } : m
        ));
    };

    // --- Dynamic Standings Calculation ---
    const getStandings = (tournament: 'apertura' | 'clausura') => {
        // Start with clean stats for all teams
        const currentStatsMap: Record<string, Team['stats']> = {};
        teams.forEach(t => {
            currentStatsMap[t.id] = {
                played: 0, won: 0, drawn: 0, lost: 0, gf: 0, gc: 0, pts: 0, goalDiff: 0
            };
        });

        const relevantMatches = matches.filter(m => m.tournament === tournament && m.isPlayed);

        relevantMatches.forEach(m => {
            if (m.homeScore === null || m.awayScore === null) return;

            const homeId = m.homeTeamId;
            const awayId = m.awayTeamId;

            // Update Home
            const h = currentStatsMap[homeId];
            if (h) {
                h.played++;
                h.gf += m.homeScore;
                h.gc += m.awayScore;
                h.goalDiff = h.gf - h.gc;
                if (m.homeScore > m.awayScore) { h.won++; h.pts += 3; }
                else if (m.homeScore === m.awayScore) { h.drawn++; h.pts += 1; }
                else { h.lost++; }
            }

            // Update Away
            const a = currentStatsMap[awayId];
            if (a) {
                a.played++;
                a.gf += m.awayScore;
                a.gc += m.homeScore;
                a.goalDiff = a.gf - a.gc;
                if (m.awayScore > m.homeScore) { a.won++; a.pts += 3; }
                else if (m.awayScore === m.homeScore) { a.drawn++; a.pts += 1; }
                else { a.lost++; }
            }
        });

        // Return teams with computed stats
        const computedTeams = teams.map(t => ({
            ...t,
            stats: currentStatsMap[t.id] || t.stats // Fallback
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

        return teams.map(t => ({ ...t, stats: currentStatsMap[t.id] }));
    };

    return {
        teams, // Raw teams (with player goal data)
        matches, // All matches
        simulateMatch,
        simulateAll,
        resetTournament,
        updateMatch,
        getStandings,
        getCombinedStats
    };
};
