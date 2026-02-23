'use client';

import { useTournament } from '@/hooks/useTournament';
import { AnnualTable } from '@/components/AnnualTable';

export default function AnnualPage() {
    const { teams } = useTournament();
    return <AnnualTable teams={teams} />;
}
