export type Zone = 'A' | 'B';

export interface Player {
    id: string;
    name: string;
    position: 'GK' | 'DEF' | 'MID' | 'FWD';
    age: number;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
    matchesPlayed: number;
}

export interface AverageStats {
    pts2024: number | null; // null if not in first division
    pts2025: number | null;
    pj2024: number; // 0 if not played
    pj2025: number;
}

export interface Team {
    id: string;
    apiId?: number; // API-Football ID
    name: string;
    shortName: string;
    logo: string;
    zone: Zone;
    coach: string;
    stadium: string;
    stadiumCapacity: number;
    membersCount: number;
    formation: string;
    players: Player[];
    stats: {
        played: number;
        won: number;
        drawn: number;
        lost: number;
        gf: number;
        gc: number;
        pts: number;
        goalDiff: number;
    };
    streaks: {
        win: number;
        unbeaten: number;
        loss: number;
    };
    form: string[];
    homeStats: Team['stats'];
    awayStats: Team['stats'];
    positionHistory: number[];
    averages: {
        pts2024: number | null;
        pj2024: number;
        pts2025: number | null;
        pj2025: number;
    };
}

export interface Match {
    id: string;
    round: number;
    homeTeamId: string;
    awayTeamId: string;
    homeScore: number | null;
    awayScore: number | null;
    isPlayed: boolean;
    tournament: 'apertura' | 'clausura';
    type?: 'regular' | 'interzonal' | 'interzonal_special'; // Optional to maintain compat
}

export interface PlayoffMatch {
    id: string;
    round: 'Octavos' | 'Cuartos' | 'Semis' | 'Final';
    homeTeamId?: string; // Can be undefined if not yet determined
    awayTeamId?: string;
    homeScore?: number;
    awayScore?: number;
    winnerId?: string;
    nextMatchId?: string; // To link the bracket
}
