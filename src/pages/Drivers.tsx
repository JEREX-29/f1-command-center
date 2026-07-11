import { useState, useEffect } from 'react';
import { Calendar, Users, ExternalLink } from 'lucide-react';
import { standingsApi } from '../api/standings';
import { useTheme } from '../context/ThemeContext';
import { getTeamColorByName, getDriverFlag } from '../api/f1Data';

export default function Drivers() {
  const { season } = useTheme();
  const [drivers, setDrivers] = useState<any[]>([]);
  const [standings, setStandings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      standingsApi.getDriverInfo(season).catch(() => []),
      standingsApi.getDriverStandings(season).catch(() => []),
    ]).then(([drv, std]) => {
      setDrivers(drv);
      setStandings(std);
      setLoading(false);
    });
  }, [season]);

  if (loading) {
    return <div className="loading-spinner"><div className="spinner" /></div>;
  }

  // Merge driver info with standings
  const driverCards = standings.length > 0 ? standings.map((s: any) => {
    const info = drivers.find((d: any) => d.driverId === s.Driver.driverId);
    return { ...s.Driver, ...info, team: s.Constructors?.[0]?.name, position: s.position, points: s.points, wins: s.wins };
  }) : drivers.map((d: any) => ({ ...d, team: '', position: '', points: '0', wins: '0' }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="page-controls">
        <div className="season-filter">
          <Calendar size={14} />
          <span>Season</span>
          <strong>{season}</strong>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {driverCards.map((d: any, i: number) => {
          const teamColor = getTeamColorByName(d.team);
          return (
            <div key={d.driverId || i} className="card card-hover" style={{
              position: 'relative', overflow: 'hidden',
              borderTop: `3px solid ${teamColor}`,
            }}>
              {/* Position badge */}
              {d.position && (
                <div style={{
                  position: 'absolute', top: 12, right: 12,
                  background: 'rgba(255,255,255,0.06)', padding: '2px 10px',
                  borderRadius: 12, fontSize: 12, fontWeight: 700
                }}>
                  P{d.position}
                </div>
              )}

              {/* Driver number */}
              <div style={{
                fontSize: 48, fontWeight: 800, color: teamColor, opacity: 0.15,
                position: 'absolute', top: -5, right: 10, lineHeight: 1,
                fontFamily: 'var(--font-heading)'
              }}>
                {d.permanentNumber || d.number || ''}
              </div>

              {/* Avatar placeholder */}
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: `linear-gradient(135deg, ${teamColor}33, ${teamColor}11)`,
                border: `2px solid ${teamColor}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 700, marginBottom: 12,
                color: teamColor
              }}>
                {(d.givenName?.[0] || '') + (d.familyName?.[0] || '')}
              </div>

              {/* Name */}
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 2 }}>
                {d.givenName} <span style={{ color: teamColor }}>{d.familyName}</span>
              </div>

              {/* Team */}
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                {d.team || 'Unknown Team'}
              </div>

              {/* Stats row */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
                padding: '10px 0', borderTop: '1px solid var(--border-primary)'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Points</div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{d.points}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Wins</div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{d.wins}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Flag</div>
                  <div style={{ fontSize: 20 }}>{getDriverFlag(d.nationality)}</div>
                </div>
              </div>

              {/* Number badge */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border-primary)'
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 12, color: 'var(--text-secondary)'
                }}>
                  <span style={{
                    background: teamColor, color: '#000', fontWeight: 700,
                    padding: '2px 8px', borderRadius: 4, fontSize: 13
                  }}>
                    #{d.permanentNumber || d.number || '—'}
                  </span>
                  {d.nationality}
                </div>
                {d.url && (
                  <a href={d.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)' }}>
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {driverCards.length === 0 && (
        <div className="empty-state">
          <Users size={48} />
          <h3>No Drivers Found</h3>
          <p>Driver information for {season} is not available.</p>
        </div>
      )}
    </div>
  );
}
