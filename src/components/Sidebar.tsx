import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Radio, Calendar, FileText, Trophy, Award,
  Users, Building2, BarChart3, GitCompare, TrendingUp,
  Gauge, Timer, Wrench, Settings, Skull, MapPin,
  MessageSquare
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: LayoutDashboard },
  { path: '/live-timing', label: 'Live Timing', icon: Radio },
  { path: '/schedule', label: 'Schedule', icon: Calendar },
  { path: '/results', label: 'Results', icon: FileText },
  { path: '/driver-standings', label: 'Driver Standings', icon: Trophy },
  { path: '/constructor-standings', label: 'Constructor Standings', icon: Award },
  { path: '/drivers', label: 'Drivers', icon: Users },
  { path: '/teams', label: 'Teams', icon: Building2 },
  { path: '/driver-stats', label: 'Driver Stats', icon: BarChart3 },
  { path: '/head-to-head', label: 'Head To Head', icon: GitCompare },
  { path: '/consistency', label: 'Consistency', icon: TrendingUp },
  { path: '/race-pace', label: 'Race Pace', icon: Gauge },
  { path: '/pit-stops', label: 'Pit Stops', icon: Timer },
  { path: '/tech-updates', label: 'Tech Updates', icon: Wrench },
  { path: '/used-elements', label: 'Used Elements', icon: Settings },
  { path: '/destructors-championship', label: 'Destructors Championship', icon: Skull },
  { path: '/track-dna', label: 'Track DNA', icon: MapPin },
  { path: '/feedback', label: 'Feedback', icon: MessageSquare },
];

export default function Sidebar() {
  const { sidebarCollapsed } = useTheme();
  const location = useLocation();

  return (
    <aside className={`app-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <NavLink to="/" className="sidebar-logo">
        <div className="sidebar-logo-icon">F</div>
        <div>
          <div className="sidebar-logo-text">Formula 1 Dashboard</div>
          <div className="sidebar-logo-sub">Go back to the Website</div>
        </div>
      </NavLink>

      <div className="sidebar-menu-label">Menu</div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
              end={item.path === '/'}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
