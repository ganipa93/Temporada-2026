/* ─── Monte Carlo Web Worker ───
   Runs simulations off the main thread.
   Messages IN:  { teams, matches, tournament, numSims }
   Messages OUT: { projections: TeamProjection[] }
─── */

interface TeamData {
    id: string; name: string; shortName: string; logo: string; zone: string;
}
interface MatchData {
    homeTeamId: string; awayTeamId: string;
    homeScore: number | null; awayScore: number | null;
    isPlayed: boolean; tournament: string;
}
interface TeamProjection {
    teamId: string; name: string; shortName: string; logo: string; zone: string;
    currentPts: number; currentGD: number;
    championPct: number; top4Pct: number; qualifyPct: number;
    bottom3Pct: number; lastPct: number;
    avgPts: number; avgPos: number;
    positionDist: number[];
}

self.onmessage = (e: MessageEvent) => {
    const { teams, matches, tournament, numSims = 2000 } = e.data as {
        teams: TeamData[]; matches: MatchData[]; tournament: string; numSims?: number;
    };

    const tourneyMatches = matches.filter(m => m.tournament === tournament);
    const playedMatches = tourneyMatches.filter(m => m.isPlayed);
    const unplayedMatches = tourneyMatches.filter(m => !m.isPlayed);

    if (tourneyMatches.length === 0) {
        self.postMessage({ projections: [] });
        return;
    }

    const zoneTeams: Record<string, TeamData[]> = { A: [], B: [] };
    teams.forEach(t => { if (zoneTeams[t.zone]) zoneTeams[t.zone].push(t); });
    const zoneSize = Math.max(zoneTeams.A.length, zoneTeams.B.length, 1);

    // Accumulators
    const posCount: Record<string, number[]> = {};
    const ptsSum: Record<string, number> = {};
    const posSum: Record<string, number> = {};
    const champCount: Record<string, number> = {};
    const top4Count: Record<string, number> = {};
    const qualifyCount: Record<string, number> = {};
    const bottom3Count: Record<string, number> = {};
    const lastCount: Record<string, number> = {};

    teams.forEach(t => {
        posCount[t.id] = new Array(zoneSize).fill(0);
        ptsSum[t.id] = 0; posSum[t.id] = 0;
        champCount[t.id] = 0; top4Count[t.id] = 0;
        qualifyCount[t.id] = 0; bottom3Count[t.id] = 0; lastCount[t.id] = 0;
    });

    // Base stats from played matches
    const baseStats: Record<string, { pts: number; gd: number; gf: number }> = {};
    teams.forEach(t => { baseStats[t.id] = { pts: 0, gd: 0, gf: 0 }; });

    playedMatches.forEach(m => {
        if (m.homeScore === null || m.awayScore === null) return;
        const hid = m.homeTeamId, aid = m.awayTeamId;
        baseStats[hid].gf += m.homeScore; baseStats[hid].gd += m.homeScore - m.awayScore;
        baseStats[aid].gf += m.awayScore; baseStats[aid].gd += m.awayScore - m.homeScore;
        if (m.homeScore > m.awayScore) baseStats[hid].pts += 3;
        else if (m.homeScore === m.awayScore) { baseStats[hid].pts += 1; baseStats[aid].pts += 1; }
        else baseStats[aid].pts += 3;
    });

    // Run N simulations
    for (let sim = 0; sim < numSims; sim++) {
        const simStats: Record<string, { pts: number; gd: number; gf: number }> = {};
        teams.forEach(t => { simStats[t.id] = { ...baseStats[t.id] }; });

        unplayedMatches.forEach(m => {
            const hs = Math.floor(Math.random() * 4);
            const as_ = Math.floor(Math.random() * 3);
            simStats[m.homeTeamId].gf += hs; simStats[m.homeTeamId].gd += hs - as_;
            simStats[m.awayTeamId].gf += as_; simStats[m.awayTeamId].gd += as_ - hs;
            if (hs > as_) simStats[m.homeTeamId].pts += 3;
            else if (hs === as_) { simStats[m.homeTeamId].pts += 1; simStats[m.awayTeamId].pts += 1; }
            else simStats[m.awayTeamId].pts += 3;
        });

        for (const zone of ['A', 'B']) {
            const zt = (zoneTeams[zone] || [])
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

    const projections: TeamProjection[] = teams.map(t => ({
        teamId: t.id, name: t.name, shortName: t.shortName, logo: t.logo, zone: t.zone,
        currentPts: baseStats[t.id].pts, currentGD: baseStats[t.id].gd,
        championPct: Math.round((champCount[t.id] / numSims) * 1000) / 10,
        top4Pct: Math.round((top4Count[t.id] / numSims) * 1000) / 10,
        qualifyPct: Math.round((qualifyCount[t.id] / numSims) * 1000) / 10,
        bottom3Pct: Math.round((bottom3Count[t.id] / numSims) * 1000) / 10,
        lastPct: Math.round((lastCount[t.id] / numSims) * 1000) / 10,
        avgPts: Math.round((ptsSum[t.id] / numSims) * 10) / 10,
        avgPos: Math.round((posSum[t.id] / numSims) * 10) / 10,
        positionDist: posCount[t.id].map(c => Math.round((c / numSims) * 1000) / 10),
    }));

    projections.sort((a, b) => b.championPct - a.championPct || a.avgPos - b.avgPos);
    self.postMessage({ projections });
};

