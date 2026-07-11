import { Outlet, useLocation } from 'react-router-dom';
import { Settings, PanelLeftClose, PanelLeft } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { AVAILABLE_SEASONS } from '../api/f1Data';
import Sidebar from './Sidebar';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Home',
  '/live-timing': 'Live Timing',
  '/schedule': 'Schedule',
  '/results': 'Results',
  '/driver-standings': 'Driver Standings',
  '/constructor-standings': 'Constructor Standings',
  '/drivers': 'Drivers',
  '/teams': 'Teams',
  '/driver-stats': 'Driver Stats',
  '/head-to-head': 'Head To Head',
  '/consistency': 'Consistency',
  '/race-pace': 'Race Pace',
  '/pit-stops': 'Pit Stops',
  '/tech-updates': 'Tech Updates',
  '/used-elements': 'Used Elements',
  '/destructors-championship': 'Destructors Championship',
  '/track-dna': 'Track DNA',
  '/feedback': 'Feedback',
};

export default function Layout() {
  const { theme, toggleTheme, sidebarCollapsed, toggleSidebar, season, setSeason } = useTheme();
  const location = useLocation();

  const pageTitle = PAGE_TITLES[location.pathname] || 'Home';

  return (
    <div className="app-layout">
      <Sidebar />

      <div className={`app-main-wrapper ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <header className="app-header">
          <div className="app-header-left">
            <button className="sidebar-toggle" onClick={toggleSidebar} title="Toggle sidebar">
              {sidebarCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
            </button>
            <div className="app-header-title">
              <span style={{ opacity: 0.5 }}>📋</span>
              {pageTitle}
            </div>
          </div>

          <div className="app-header-right">
            <button className="theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
              <Settings size={18} />
            </button>
          </div>
        </header>

        <main className="app-content">
          <Outlet context={{ season, setSeason, seasons: AVAILABLE_SEASONS }} />
        </main>
      </div>
    </div>
  );
}
