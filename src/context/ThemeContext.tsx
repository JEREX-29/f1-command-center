import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface ThemeContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  season: number;
  setSeason: (year: number) => void;
  spoilerProtection: boolean;
  toggleSpoilerProtection: () => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('f1-theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  const [season, setSeason] = useState<number>(() => {
    const saved = localStorage.getItem('f1-season');
    return saved ? parseInt(saved) : 2025;
  });

  const [spoilerProtection, setSpoilerProtection] = useState<boolean>(() => {
    const saved = localStorage.getItem('f1-spoiler');
    return saved === 'true';
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('f1-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('f1-season', String(season));
  }, [season]);

  useEffect(() => {
    localStorage.setItem('f1-spoiler', String(spoilerProtection));
  }, [spoilerProtection]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  const toggleSpoilerProtection = () => setSpoilerProtection(s => !s);
  const toggleSidebar = () => setSidebarCollapsed(c => !c);

  return (
    <ThemeContext.Provider value={{
      theme, toggleTheme,
      season, setSeason,
      spoilerProtection, toggleSpoilerProtection,
      sidebarCollapsed, toggleSidebar
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
