import { useState, useEffect } from 'react';
import { Calendar, Trophy } from 'lucide-react';
import { standingsApi } from '../api/standings';
import { useTheme } from '../context/ThemeContext';
import { getTeamColorByName, getDriverFlag } from '../api/f1Data';

export default function DriverStandings() {
  const { season } = useTheme();
  const [standings, setStandings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    standingsApi.getDriverStandings(season)
      .then(setStandings)
      .catch(() => setStandings([]))
      .finally(() => setLoading(false));
  }, [season]);

  if (loading) {
    return <div className="loading-spinner"><div className="spinner" /></div>;
  }

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
            <Trophy size={20} style={{ color: 'var(--accent-yellow)' }} />
            {season} Driver Championship Standings
          </h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>POS.</th>
                <th>DRIVER</th>
                <th>NATIONALITY</th>
                <th>TEAM</th>
                <th>WINS</th>
                <th>POINTS</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((d: any, i: number) => {
                const teamColor = getTeamColorByName(d.Constructors?.[0]?.name);
                return (
                  <tr key={i}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          fontWeight: 800, fontSize: 16,
                          color: i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : 'var(--text-primary)'
                        }}>
                          {d.position}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="team-color-bar" style={{ backgroundColor: teamColor, height: 28 }} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>
                            {d.Driver.givenName} <span style={{ fontWeight: 700 }}>{d.Driver.familyName}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {getDriverFlag(d.Driver.nationality)}
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{d.Driver.nationality}</span>
                      </span>
                    </td>
                    <td>
                      <span style={{ color: teamColor, fontWeight: 500 }}>
                        {d.Constructors?.[0]?.name}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{d.wins}</td>
                    <td>
                      <span style={{
                        fontWeight: 700, fontSize: 16,
                        background: 'rgba(37,99,235,0.1)',
                        padding: '4px 12px', borderRadius: 6,
                        color: 'var(--accent-blue)'
                      }}>
                        {d.points}
                      </span>
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
          <Trophy size={48} />
          <h3>No Standings Available</h3>
          <p>Driver standings for {season} are not available yet.</p>
        </div>
      )}
    </div>
  );
}
