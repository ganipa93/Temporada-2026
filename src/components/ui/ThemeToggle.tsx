'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        const saved = localStorage.getItem('theme');
        if (saved === 'light') {
            setIsDark(false);
            document.documentElement.classList.add('light');
        }
    }, []);

    const toggle = () => {
        setIsDark(d => {
            const next = !d;
            if (next) {
                document.documentElement.classList.remove('light');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.classList.add('light');
                localStorage.setItem('theme', 'light');
            }
            return next;
        });
    };

    return (
        <button
            onClick={toggle}
            className="p-2 rounded-xl border transition-all hover:scale-105 flex-shrink-0"
            style={{
                background: 'var(--surface)',
                borderColor: 'var(--border-strong)',
                color: isDark ? '#FBBF24' : '#007ACC'
            }}
            title={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
        >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
    );
}
