'use client';

import { useTournament } from '@/hooks/useTournament';
import { TeamsView } from '@/components/TeamsView';

export default function EquiposPage() {
    const { teams } = useTournament();
    return <TeamsView teams={teams} />;
}
