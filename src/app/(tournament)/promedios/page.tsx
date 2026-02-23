'use client';

import { useMemo } from 'react';
import { useTournament } from '@/hooks/useTournament';
import { PromediosTable } from '@/components/PromediosTable';

export default function PromediosPage() {
    const { matches, getCombinedStats } = useTournament();
    const promediosTeams = useMemo(() => getCombinedStats(), [matches]);
    return <PromediosTable teams={promediosTeams} />;
}
