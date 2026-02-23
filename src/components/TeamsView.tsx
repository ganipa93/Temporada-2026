'use client';

import React, { useState, useMemo } from 'react';
import type { Team, Player } from '@/lib/types';
import { Search, User, Users, Ghost, Layout, ChevronLeft, Building2 } from 'lucide-react';

interface TeamsViewProps {
    teams: Team[];
}

export const TeamsView: React.FC<TeamsViewProps> = ({ teams }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

    const filteredTeams = useMemo(() =>
        teams.filter(t =>
            t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.shortName.toLowerCase().includes(searchTerm.toLowerCase())
        ),
        [teams, searchTerm]
    );

    const selectedTeam = useMemo(() =>
        teams.find(t => t.id === selectedTeamId),
        [teams, selectedTeamId]
    );

    const groupPlayers = (players: Player[]) => ({
        GK: players.filter(p => p.position === 'GK'),
        DEF: players.filter(p => p.position === 'DEF'),
        MID: players.filter(p => p.position === 'MID'),
        FWD: players.filter(p => p.position === 'FWD'),
    });

    const posLabel: Record<string, string> = {
        GK: 'Arqueros', DEF: 'Defensores', MID: 'Mediocampistas', FWD: 'Delanteros'
    };

    /* ── TEAM DETAIL VIEW ── */
    if (selectedTeam) {
        const grouped = groupPlayers(selectedTeam.players);

        return (
            <div className="max-w-4xl mx-auto">
                {/* Back button */}
                <button
                    onClick={() => setSelectedTeamId(null)}
                    className="flex items-center gap-2 mb-5 text-sm font-semibold transition-colors theme-fade"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                    <ChevronLeft size={18} />
                    Volver a la lista
                </button>

                <div className="card theme-fade overflow-hidden">
                    {/* Banner */}
                    <div className="relative h-28 flex items-end"
                        style={{ background: 'linear-gradient(135deg, #0D2240 0%, #1C3A5C 100%)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                        <div className="absolute -bottom-6 left-6 flex items-end gap-5">
                            <div className="w-20 h-20 rounded-2xl border p-3 shadow-xl"
                                style={{ background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
                                <img src={selectedTeam.logo} alt={selectedTeam.name} className="w-full h-full object-contain" />
                            </div>
                            <div className="mb-2">
                                <h2 className="text-2xl font-black text-white tracking-tight leading-none">{selectedTeam.name}</h2>
                                <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Liga Profesional de Fútbol</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-12 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Info */}
                        <div className="space-y-5">
                            <h3 className="text-[10px] font-black uppercase tracking-widest pb-2"
                                style={{ color: 'var(--text-faint)', borderBottom: '1px solid var(--border)' }}>
                                Información General
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { icon: <User size={16} style={{ color: '#4FC3F7' }} />, label: 'Director Técnico', value: selectedTeam.coach || 'No disponible' },
                                    { icon: <Layout size={16} style={{ color: '#C084FC' }} />, label: 'Esquema Táctico', value: selectedTeam.formation || '4-4-2' },
                                    { icon: <Building2 size={16} style={{ color: '#4ADE80' }} />, label: 'Estadio', value: selectedTeam.stadium || 'No disponible', sub: selectedTeam.stadiumCapacity ? `Cap. ${selectedTeam.stadiumCapacity.toLocaleString()}` : undefined },
                                    { icon: <Users size={16} style={{ color: '#FBBF24' }} />, label: 'Socios Oficiales', value: selectedTeam.membersCount?.toLocaleString() || 'N/A' },
                                ].map(({ icon, label, value, sub }) => (
                                    <div key={label} className="flex items-start gap-3">
                                        <div className="mt-0.5 flex-shrink-0">{icon}</div>
                                        <div>
                                            <p className="text-[10px] uppercase font-semibold mb-0.5" style={{ color: 'var(--text-faint)' }}>{label}</p>
                                            <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>{value}</p>
                                            {sub && <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{sub}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Roster */}
                        <div className="md:col-span-2 space-y-5">
                            <h3 className="text-[10px] font-black uppercase tracking-widest pb-2"
                                style={{ color: 'var(--text-faint)', borderBottom: '1px solid var(--border)' }}>
                                Plantel Profesional
                            </h3>
                            <div className="space-y-5">
                                {Object.entries(grouped).map(([pos, players]) =>
                                    players.length > 0 && (
                                        <div key={pos}>
                                            <h4 className="text-[10px] font-black uppercase tracking-widest mb-2"
                                                style={{ color: 'var(--accent)' }}>
                                                {posLabel[pos]}
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {players.map(player => (
                                                    <div key={player.id}
                                                        className="rounded-xl p-3 border theme-fade"
                                                        style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div>
                                                                <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>{player.name}</p>
                                                                <p className="text-[10px]" style={{ color: 'var(--text-faint)' }}>
                                                                    {player.age} años · {player.matchesPlayed} PJ
                                                                </p>
                                                            </div>
                                                            <span className="text-[9px] font-black px-2 py-1 rounded-md"
                                                                style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                                                                {pos}
                                                            </span>
                                                        </div>
                                                        <div className="flex gap-4 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                                                            <div className="text-[10px] flex gap-1">
                                                                <span style={{ color: 'var(--text-faint)' }}>G:</span>
                                                                <span className="font-bold" style={{ color: 'var(--accent)' }}>{player.goals}</span>
                                                            </div>
                                                            <div className="text-[10px] flex gap-1">
                                                                <span style={{ color: 'var(--text-faint)' }}>A:</span>
                                                                <span className="font-bold" style={{ color: 'var(--win)' }}>{player.assists}</span>
                                                            </div>
                                                            <div className="text-[10px] flex gap-1">
                                                                <span style={{ color: 'var(--text-faint)' }}>TA:</span>
                                                                <span className="font-bold" style={{ color: 'var(--gold)' }}>{player.yellowCards}</span>
                                                            </div>
                                                            <div className="text-[10px] flex gap-1">
                                                                <span style={{ color: 'var(--text-faint)' }}>TR:</span>
                                                                <span className="font-bold" style={{ color: 'var(--loss)' }}>{player.redCards}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /* ── TEAMS GRID VIEW ── */
    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter uppercase" style={{ color: 'var(--text)' }}>Equipos</h2>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Explorá los planteles de la Liga Profesional</p>
                </div>

                {/* Search */}
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--text-faint)' }} />
                    <input
                        type="text"
                        placeholder="Buscar club..."
                        className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm border outline-none theme-fade"
                        style={{
                            background: 'var(--surface)',
                            borderColor: 'var(--border-strong)',
                            color: 'var(--text)',
                        }}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filteredTeams.map(team => (
                    <button
                        key={team.id}
                        onClick={() => setSelectedTeamId(team.id)}
                        className="group card rounded-2xl p-5 flex flex-col items-center gap-3 transition-all hover:scale-[1.03] theme-fade"
                        style={{ borderColor: 'var(--border)' }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)';
                            (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)';
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                            (e.currentTarget as HTMLElement).style.background = 'var(--surface)';
                        }}
                    >
                        <div className="w-14 h-14 transition-transform group-hover:scale-110 duration-300">
                            <img src={team.logo} alt={team.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="text-center">
                            <p className="text-xs font-black uppercase tracking-tight leading-tight" style={{ color: 'var(--text)' }}>
                                {team.name}
                            </p>
                            <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5" style={{ color: 'var(--text-faint)' }}>
                                {team.shortName}
                            </p>
                        </div>
                    </button>
                ))}
            </div>

            {/* Empty state */}
            {filteredTeams.length === 0 && (
                <div className="py-20 text-center space-y-3">
                    <Ghost size={56} style={{ color: 'var(--text-faint)' }} className="mx-auto" />
                    <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>No encontramos ningún club con ese nombre...</p>
                </div>
            )}
        </div>
    );
};

