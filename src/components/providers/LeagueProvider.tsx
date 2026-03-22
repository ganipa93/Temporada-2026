'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type League = 'primera' | 'nacional-b';

interface LeagueContextProps {
  league: League;
  setLeague: (league: League) => void;
}

const LeagueContext = createContext<LeagueContextProps>({ 
  league: 'primera', 
  setLeague: () => {} 
});

export const LeagueProvider = ({ children }: { children: ReactNode }) => {
  // Try to load initial from localStorage safely on client
  const [league, setLeagueState] = useState<League>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('active_league');
      return (saved as League) || 'primera';
    }
    return 'primera';
  });

  const setLeague = (newLeague: League) => {
    setLeagueState(newLeague);
    if (typeof window !== 'undefined') {
      localStorage.setItem('active_league', newLeague);
    }
  };

  return (
    <LeagueContext.Provider value={{ league, setLeague }}>
      {children}
    </LeagueContext.Provider>
  );
};

export const useLeague = () => useContext(LeagueContext);
