'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

export function QueryProvider({ children }: { children: ReactNode }) {
    const [client] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 10_000,        // Data is fresh for 10s
                        gcTime: 5 * 60 * 1000,    // Keep in cache for 5 min
                        retry: 2,
                        refetchOnWindowFocus: true,
                    },
                },
            }),
    );

    return (
        <QueryClientProvider client={client}>
            {children}
        </QueryClientProvider>
    );
}

