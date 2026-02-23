'use client';

import React from 'react';
import { useTournament } from '@/hooks/useTournament';
import { TeamsView } from '@/components/TeamsView';

export default function EquiposPage() {
    const { matches, getCombinedStats } = useTournament();
    const teamsWithStats = React.useMemo(() => getCombinedStats(), [matches, getCombinedStats]);
    return <TeamsView teams={teamsWithStats} />;
}
