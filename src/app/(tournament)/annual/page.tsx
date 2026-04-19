'use client';

import { useTournament } from '@/hooks/useTournament';
import { AnnualTable } from '@/components/AnnualTable';
import { useMemo } from 'react';

export default function AnnualPage() {
    const { getCombinedStats, matches } = useTournament();
    
    // We useMemo to avoid recalculating the combined stats on every render unnecessarily
    const annualTeams = useMemo(() => getCombinedStats(), [matches]);

    return <AnnualTable teams={annualTeams} />;
}
