import { useState, useEffect } from 'react';
import { Calendar, Wrench, ArrowUpRight, Tag } from 'lucide-react';
import { standingsApi } from '../api/standings';
import { useTheme } from '../context/ThemeContext';
import { getTeamColorByName } from '../api/f1Data';

const UPGRADE_CATEGORIES = ['Front Wing', 'Rear Wing', 'Floor', 'Diffuser', 'Sidepods', 'Suspension', 'Engine Cover', 'Halo', 'Bargeboard', 'Brake Ducts'];

export default function TechUpdates() {
  const { season } = useTheme();
  const [constructors, setConstructors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState('all');

  useEffect(() => {
    setLoading(true);
    standingsApi.getConstructorStandings(season)
      .then(setConstructors)
      .catch(() => setConstructors([]))
      .finally(() => setLoading(false));
  }, [season]);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  // Generate simulated tech updates based on team data
  const generateUpdates = () => {
    const updates: any[] = [];
    constructors.forEach((c: any, teamIdx: number) => {
      const teamName = c.Constructor.name;
      const teamColor = getTeamColorByName(teamName);
      const numUpdates = Math.max(2, 8 - teamIdx);

      for (let i = 0; i < numUpdates; i++) {
        const category = UPGRADE_CATEGORIES[Math.floor((teamIdx * 3 + i) % UPGRADE_CATEGORIES.length)];
        const round = Math.min(Math.floor(i * 3) + 1, 20);
        updates.push({
          team: teamName,
          teamColor,
          category,
          round,
          description: `${teamName} introduced an updated ${category.toLowerCase()} design for Round ${round}, aiming to improve ${category.includes('Wing') ? 'downforce' : category.includes('Floor') ? 'ground effect' : 'aerodynamic efficiency'}.`,
          impact: ['High', 'Medium', 'Low'][i % 3],
        });
      }
    });
    return updates.sort((a, b) => b.round - a.round);
  };

  const allUpdates = generateUpdates();
  const filtered = selectedTeam === 'all' ? allUpdates : allUpdates.filter(u => u.team === selectedTeam);

  // Count per team
  const teamCounts: Record<string, number> = {};
  allUpdates.forEach(u => { teamCounts[u.team] = (teamCounts[u.team] || 0) + 1; });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div className="season-filter">
          <Calendar size={14} /><span>Season</span><strong>{season}</strong>
        </div>
        <select className="select-control" value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)}>
          <option value="all">All Teams</option>
          {constructors.map((c: any) => (
            <option key={c.Constructor.constructorId} value={c.Constructor.name}>{c.Constructor.name}</option>
          ))}
        </select>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
        {Object.entries(teamCounts).map(([team, count]) => (
          <div key={team} className="card" style={{
            padding: '10px 14px', cursor: 'pointer',
            borderLeft: `3px solid ${getTeamColorByName(team)}`,
            background: selectedTeam === team ? 'var(--bg-card-hover)' : undefined
          }}
            onClick={() => setSelectedTeam(team === selectedTeam ? 'all' : team)}>
            <div style={{ fontSize: 11, color: getTeamColorByName(team), fontWeight: 600, marginBottom: 2 }}>{team}</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{count}</div>
            <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>upgrades</div>
          </div>
        ))}
      </div>

      {/* Updates list */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-primary)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Wrench size={18} /> Technical Updates ({filtered.length})
          </h2>
        </div>
        <div style={{ maxHeight: 600, overflowY: 'auto' }}>
          {filtered.map((update, i) => (
            <div key={i} style={{
              padding: '14px 20px', borderBottom: '1px solid var(--border-primary)',
              display: 'flex', gap: 14, alignItems: 'flex-start'
            }}>
              <div style={{
                width: 4, minHeight: 40, borderRadius: 2,
                backgroundColor: update.teamColor, flexShrink: 0, marginTop: 2
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{update.team}</span>
                  <span className="badge badge-blue" style={{ fontSize: 9 }}>R{update.round}</span>
                  <span style={{
                    padding: '1px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                    background: update.impact === 'High' ? 'rgba(34,197,94,0.15)' : update.impact === 'Medium' ? 'rgba(234,179,8,0.15)' : 'rgba(107,114,128,0.15)',
                    color: update.impact === 'High' ? 'var(--accent-green)' : update.impact === 'Medium' ? 'var(--accent-yellow)' : 'var(--text-tertiary)',
                  }}>
                    {update.impact} Impact
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Tag size={12} style={{ color: 'var(--text-tertiary)' }} />
                  <span style={{ fontSize: 12, color: 'var(--accent-blue)', fontWeight: 500 }}>{update.category}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  {update.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="empty-state"><Wrench size={48} /><h3>No Tech Updates</h3><p>No technical updates found for the selected filters.</p></div>
      )}
    </div>
  );
}
