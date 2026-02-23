import { useMemo } from 'react';
import type { Team, Match } from '@/lib/types';

// ── Result types ──
export interface TeamProjection {
    teamId: string;
    name: string;
    shortName: string;
    logo: string;
    zone: string;
    currentPts: number;
    currentGD: number;
    // Probabilities (0–100)
    championPct: number;     // #1 in their zone
    top4Pct: number;         // top 4 → better seed in playoffs
    qualifyPct: number;      // top 8 → qualifies for playoffs
    bottom3Pct: number;      // relegation zone
    lastPct: number;         // last place in zone
    // Average projection
    avgPts: number;
    avgPos: number;
    // Position distribution: positionDist[i] = % ending in position i+1
    positionDist: number[];
}

const NUM_SIMS = 1000;

/**
 * Monte Carlo simulation: takes current matches (some played, some not),
 * runs N simulations of remaining matches, returns probability distributions.
 */
export function useMonteCarloSimulation(
    teams: Team[],
    matches: Match[],
    tournament: 'apertura' | 'clausura'
): TeamProjection[] {
    return useMemo(() => {
        const tourneyMatches = matches.filter(m => m.tournament === tournament);
        const playedMatches = tourneyMatches.filter(m => m.isPlayed);
        const unplayedMatches = tourneyMatches.filter(m => !m.isPlayed);

        // If no matches at all, return empty
        if (tourneyMatches.length === 0) return [];

        const zoneTeams: Record<string, Team[]> = { A: [], B: [] };
        teams.forEach(t => { if (zoneTeams[t.zone]) zoneTeams[t.zone].push(t); });

        const zoneSize = Math.max(zoneTeams.A.length, zoneTeams.B.length, 1);

        // Accumulators
        const posCount: Record<string, number[]> = {};  // posCount[teamId][position] = count
        const ptsSum: Record<string, number> = {};
        const posSum: Record<string, number> = {};
        const champCount: Record<string, number> = {};
        const top4Count: Record<string, number> = {};
        const qualifyCount: Record<string, number> = {};
        const bottom3Count: Record<string, number> = {};
        const lastCount: Record<string, number> = {};

        teams.forEach(t => {
            posCount[t.id] = new Array(zoneSize).fill(0);
            ptsSum[t.id] = 0;
            posSum[t.id] = 0;
            champCount[t.id] = 0;
            top4Count[t.id] = 0;
            qualifyCount[t.id] = 0;
            bottom3Count[t.id] = 0;
            lastCount[t.id] = 0;
        });

        // Pre-compute base stats from played matches
        const baseStats: Record<string, { pts: number; gd: number; gf: number }> = {};
        teams.forEach(t => { baseStats[t.id] = { pts: 0, gd: 0, gf: 0 }; });

        playedMatches.forEach(m => {
            if (m.homeScore === null || m.awayScore === null) return;
            const hid = m.homeTeamId, aid = m.awayTeamId;

            if (!baseStats[hid] || !baseStats[aid]) {
                console.warn(`[MonteCarlo] Missing team ID in baseStats: ${!baseStats[hid] ? hid : aid}. Match ID: ${m.id}`);
                return;
            }

            baseStats[hid].gf += m.homeScore;
            baseStats[hid].gd += m.homeScore - m.awayScore;
            baseStats[aid].gf += m.awayScore;
            baseStats[aid].gd += m.awayScore - m.homeScore;
            if (m.homeScore > m.awayScore) baseStats[hid].pts += 3;
            else if (m.homeScore === m.awayScore) { baseStats[hid].pts += 1; baseStats[aid].pts += 1; }
            else baseStats[aid].pts += 3;
        });

        // Run simulations
        for (let sim = 0; sim < NUM_SIMS; sim++) {
            // Clone base stats
            const simStats: Record<string, { pts: number; gd: number; gf: number }> = {};
            teams.forEach(t => {
                simStats[t.id] = { ...baseStats[t.id] };
            });

            // Simulate unplayed matches
            unplayedMatches.forEach(m => {
                const hs = Math.floor(Math.random() * 4); // 0–3 (same model as the app)
                const as = Math.floor(Math.random() * 3); // 0–2
                const hid = m.homeTeamId, aid = m.awayTeamId;

                if (!simStats[hid] || !simStats[aid]) return;

                simStats[hid].gf += hs;
                simStats[hid].gd += hs - as;
                simStats[aid].gf += as;
                simStats[aid].gd += as - hs;
                if (hs > as) simStats[hid].pts += 3;
                else if (hs === as) { simStats[hid].pts += 1; simStats[aid].pts += 1; }
                else simStats[aid].pts += 3;
            });

            // Rank by zone
            for (const zone of ['A', 'B'] as const) {
                const zt = zoneTeams[zone]
                    .map(t => ({ id: t.id, pts: simStats[t.id].pts, gd: simStats[t.id].gd, gf: simStats[t.id].gf }))
                    .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);

                zt.forEach((entry, pos) => {
                    posCount[entry.id][pos]++;
                    ptsSum[entry.id] += entry.pts;
                    posSum[entry.id] += pos + 1;
                    if (pos === 0) champCount[entry.id]++;
                    if (pos < 4) top4Count[entry.id]++;
                    if (pos < 8) qualifyCount[entry.id]++;
                    if (pos >= zt.length - 3) bottom3Count[entry.id]++;
                    if (pos === zt.length - 1) lastCount[entry.id]++;
                });
            }
        }

        // Build output
        const projections: TeamProjection[] = teams.map(t => ({
            teamId: t.id,
            name: t.name,
            shortName: t.shortName,
            logo: t.logo,
            zone: t.zone,
            currentPts: baseStats[t.id].pts,
            currentGD: baseStats[t.id].gd,
            championPct: Math.round((champCount[t.id] / NUM_SIMS) * 1000) / 10,
            top4Pct: Math.round((top4Count[t.id] / NUM_SIMS) * 1000) / 10,
            qualifyPct: Math.round((qualifyCount[t.id] / NUM_SIMS) * 1000) / 10,
            bottom3Pct: Math.round((bottom3Count[t.id] / NUM_SIMS) * 1000) / 10,
            lastPct: Math.round((lastCount[t.id] / NUM_SIMS) * 1000) / 10,
            avgPts: Math.round((ptsSum[t.id] / NUM_SIMS) * 10) / 10,
            avgPos: Math.round((posSum[t.id] / NUM_SIMS) * 10) / 10,
            positionDist: posCount[t.id].map(c => Math.round((c / NUM_SIMS) * 1000) / 10),
        }));

        // Sort by champion probability (desc), then avg position (asc)
        return projections.sort((a, b) => b.championPct - a.championPct || a.avgPos - b.avgPos);
    }, [teams, matches, tournament]);
}

