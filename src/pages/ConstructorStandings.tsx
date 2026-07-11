import { useState, useEffect } from 'react';
import { Calendar, Award } from 'lucide-react';
import { standingsApi } from '../api/standings';
import { useTheme } from '../context/ThemeContext';
import { getTeamColorByName } from '../api/f1Data';

export default function ConstructorStandings() {
  const { season } = useTheme();
  const [standings, setStandings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    standingsApi.getConstructorStandings(season)
      .then(setStandings)
      .catch(() => setStandings([]))
      .finally(() => setLoading(false));
  }, [season]);

  if (loading) {
    return <div className="loading-spinner"><div className="spinner" /></div>;
  }

  // Calculate max points for bar visualization
  const maxPoints = standings.length > 0 ? Math.max(...standings.map((s: any) => parseFloat(s.points))) : 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="page-controls">
        <div className="season-filter">
          <Calendar size={14} />
          <span>Season</span>
          <strong>{season}</strong>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-primary)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Award size={20} style={{ color: 'var(--accent-yellow)' }} />
            {season} Constructor Championship Standings
          </h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>POS.</th>
                <th>CONSTRUCTOR</th>
                <th>NATIONALITY</th>
                <th>WINS</th>
                <th>POINTS</th>
                <th style={{ width: 200 }}>PROGRESS</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((c: any, i: number) => {
                const teamColor = getTeamColorByName(c.Constructor.name);
                const pointsRatio = parseFloat(c.points) / maxPoints;
                return (
                  <tr key={i}>
                    <td>
                      <span style={{
                        fontWeight: 800, fontSize: 16,
                        color: i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : 'var(--text-primary)'
                      }}>
                        {c.position}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="team-color-bar" style={{ backgroundColor: teamColor, height: 28, width: 4 }} />
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{c.Constructor.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                      {c.Constructor.nationality}
                    </td>
                    <td style={{ fontWeight: 600 }}>{c.wins}</td>
                    <td>
                      <span style={{
                        fontWeight: 700, fontSize: 16,
                        background: 'rgba(37,99,235,0.1)',
                        padding: '4px 12px', borderRadius: 6,
                        color: 'var(--accent-blue)'
                      }}>
                        {c.points}
                      </span>
                    </td>
                    <td>
                      <div style={{
                        height: 8, borderRadius: 4, background: 'var(--bg-secondary)',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%', borderRadius: 4,
                          width: `${pointsRatio * 100}%`,
                          background: `linear-gradient(90deg, ${teamColor}, ${teamColor}aa)`,
                          transition: 'width 0.5s ease'
                        }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {standings.length === 0 && (
        <div className="empty-state">
          <Award size={48} />
          <h3>No Standings Available</h3>
          <p>Constructor standings for {season} are not available yet.</p>
        </div>
      )}
    </div>
  );
}
