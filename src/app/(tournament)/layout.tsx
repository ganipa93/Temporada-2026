'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Trophy, ArrowRightLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const NAV_ITEMS = [
    { id: 'equipos', path: '/equipos', label: 'Equipos', color: '#64748B' },
    { id: 'apertura', path: '/apertura', label: 'Apertura', color: '#4FC3F7' },
    { id: 'clausura', path: '/clausura', label: 'Clausura', color: '#C084FC' },
    { id: 'annual', path: '/annual', label: 'Anual', color: '#FBBF24', icon: <Trophy size={13} /> },
    { id: 'promedios', path: '/promedios', label: 'Promedios', color: '#F87171', icon: <ArrowRightLeft size={13} /> },
];

export default function TournamentLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    // Determine active main view from path
    const currentView = NAV_ITEMS.find(item =>
        pathname === item.path || pathname.startsWith(item.path + '/')
    )?.id || 'apertura';

    return (
        <div className="min-h-screen font-sans theme-fade" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
            {/* Top stripe */}
            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #4FC3F7 0%, #007ACC 50%, #C084FC 100%)' }} />

            <header className="max-w-7xl mx-auto px-3 md:px-6 py-3 md:py-4 flex flex-wrap items-center justify-between gap-3">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl shadow-lg flex-shrink-0"
                        style={{ background: 'var(--accent-dim)', border: '1px solid var(--border-strong)' }}>
                        <Trophy style={{ color: 'var(--accent)' }} size={22} />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-lg md:text-2xl font-black tracking-tight uppercase leading-tight"
                            style={{ color: 'var(--text)' }}>
                            Liga Profesional 2026
                        </h1>
                        <span className="text-xs md:text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                            Primera División de Argentina
                        </span>
                    </div>
                </div>

                <ThemeToggle />

                {/* Main nav */}
                <nav className="flex flex-wrap p-1 gap-1 rounded-xl border theme-fade"
                    style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                    {NAV_ITEMS.map(({ id, path, label, color, icon }) => {
                        const active = currentView === id;
                        return (
                            <button key={id}
                                onClick={() => router.push(path)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all"
                                style={active
                                    ? { background: color, color: id === 'annual' ? '#1A1A1A' : 'white', boxShadow: `0 2px 10px ${color}40` }
                                    : { color: 'var(--text-muted)' }
                                }>
                                {icon}{label}
                            </button>
                        );
                    })}
                </nav>
            </header>

            <main className="max-w-7xl mx-auto px-3 md:px-6 pb-10">
                {children}
            </main>
        </div>
    );
}
