import React, { useState, useMemo } from 'react';
import type { Team, Player } from '../types';
import { Search, User, Users, Ghost, Layout, ChevronLeft, Building2 } from 'lucide-react';

interface TeamsViewProps {
    teams: Team[];
}

export const TeamsView: React.FC<TeamsViewProps> = ({ teams }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

    const filteredTeams = useMemo(() => {
        return teams.filter(t =>
            t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.shortName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [teams, searchTerm]);

    const selectedTeam = useMemo(() =>
        teams.find(t => t.id === selectedTeamId),
        [teams, selectedTeamId]);

    const groupPlayers = (players: Player[]) => {
        return {
            GK: players.filter(p => p.position === 'GK'),
            DEF: players.filter(p => p.position === 'DEF'),
            MID: players.filter(p => p.position === 'MID'),
            FWD: players.filter(p => p.position === 'FWD'),
        };
    };

    if (selectedTeam) {
        const grouped = groupPlayers(selectedTeam.players);

        return (
            <div className="max-w-4xl mx-auto p-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <button
                    onClick={() => setSelectedTeamId(null)}
                    className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors"
                >
                    <ChevronLeft size={20} />
                    <span>Volver a la lista</span>
                </button>

                <div className="bg-surface rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                    {/* Header Banner */}
                    <div className="relative h-32 bg-gradient-to-r from-zinc-900 to-zinc-800 border-b border-white/5">
                        <div className="absolute -bottom-6 left-8 flex items-end gap-6">
                            <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-4 shadow-xl">
                                <img src={selectedTeam.logo} alt={selectedTeam.name} className="w-full h-full object-contain" />
                            </div>
                            <div className="mb-2">
                                <h2 className="text-3xl font-black text-white tracking-tight">{selectedTeam.name}</h2>
                                <p className="text-zinc-400 font-medium">Liga Profesional de Fútbol</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-12 p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Info Section */}
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-white/5 pb-2">Información General</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-zinc-300">
                                        <User className="text-blue-400" size={18} />
                                        <div>
                                            <p className="text-[10px] text-zinc-500 uppercase">Director Técnico</p>
                                            <p className="font-bold">{selectedTeam.coach || 'No disponible'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-zinc-300">
                                        <Layout className="text-purple-400" size={18} />
                                        <div>
                                            <p className="text-[10px] text-zinc-500 uppercase">Esquema Táctico</p>
                                            <p className="font-bold">{selectedTeam.formation || '4-4-2'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-zinc-300">
                                        <Building2 className="text-emerald-400" size={18} />
                                        <div>
                                            <p className="text-[10px] text-zinc-500 uppercase">Estadio</p>
                                            <p className="font-bold">{selectedTeam.stadium || 'No disponible'}</p>
                                            <p className="text-xs text-zinc-500">Capacidad: {selectedTeam.stadiumCapacity?.toLocaleString() || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-zinc-300">
                                        <Users className="text-amber-400" size={18} />
                                        <div>
                                            <p className="text-[10px] text-zinc-500 uppercase">Socios Oficiales</p>
                                            <p className="font-bold">{selectedTeam.membersCount?.toLocaleString() || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Roster Section */}
                        <div className="md:col-span-2 space-y-6">
                            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-white/5 pb-2">Plantel Profesional</h3>

                            <div className="grid grid-cols-1 gap-6">
                                {Object.entries(grouped).map(([pos, players]) => (
                                    players.length > 0 && (
                                        <div key={pos} className="space-y-2">
                                            <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-tighter ml-1">
                                                {pos === 'GK' ? 'Arqueros' : pos === 'DEF' ? 'Defensores' : pos === 'MID' ? 'Mediocampistas' : 'Delanteros'}
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {players.map(player => (
                                                    <div key={player.id} className="bg-zinc-900/50 border border-white/5 p-3 rounded-lg flex justify-between items-center group hover:bg-white/5 hover:border-white/10 transition-all">
                                                        <div>
                                                            <p className="font-bold text-sm text-zinc-200 group-hover:text-white transition-colors">{player.name}</p>
                                                            <p className="text-[10px] text-zinc-500">{player.age} años</p>
                                                        </div>
                                                        <div className="text-[10px] font-mono font-bold bg-zinc-800 text-zinc-400 px-2 py-1 rounded">
                                                            {pos}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-4 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tighter">EQUIPOS</h2>
                    <p className="text-zinc-500 font-medium">Explora los planteles de la Liga Profesional</p>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar club..."
                        className="w-full bg-surface border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredTeams.map(team => (
                    <button
                        key={team.id}
                        onClick={() => setSelectedTeamId(team.id)}
                        className="bg-surface border border-white/5 rounded-2xl p-6 flex flex-col items-center gap-4 hover:bg-white/5 hover:border-white/10 hover:scale-[1.02] transition-all group shadow-lg"
                    >
                        <div className="w-16 h-16 transition-transform group-hover:scale-110 duration-300">
                            <img src={team.logo} alt={team.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-black text-zinc-200 group-hover:text-white uppercase tracking-tight">{team.name}</p>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{team.shortName}</p>
                        </div>
                    </button>
                ))}
            </div>

            {filteredTeams.length === 0 && (
                <div className="py-20 text-center space-y-4">
                    <Ghost className="mx-auto text-zinc-700" size={64} />
                    <p className="text-zinc-500 font-medium italic">No encontramos ningún club con ese nombre...</p>
                </div>
            )}
        </div>
    );
};
