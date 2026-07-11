import { useState, useEffect } from 'react';
import { Calendar, Building2, ExternalLink } from 'lucide-react';
import { standingsApi } from '../api/standings';
import { useTheme } from '../context/ThemeContext';
import { getTeamColorByName } from '../api/f1Data';

export default function Teams() {
  const { season } = useTheme();
  const [constructors, setConstructors] = useState<any[]>([]);
  const [standings, setStandings] = useState<any[]>([]);
  const [driverStandings, setDriverStandings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      standingsApi.getConstructorInfo(season).catch(() => []),
      standingsApi.getConstructorStandings(season).catch(() => []),
      standingsApi.getDriverStandings(season).catch(() => []),
    ]).then(([cons, cStd, dStd]) => {
      setConstructors(cons);
      setStandings(cStd);
      setDriverStandings(dStd);
      setLoading(false);
    });
  }, [season]);

  if (loading) {
    return <div className="loading-spinner"><div className="spinner" /></div>;
  }

  // Merge info
  const teamCards = standings.length > 0 ? standings.map((s: any) => {
    const info = constructors.find((c: any) => c.constructorId === s.Constructor.constructorId);
    const teamDrivers = driverStandings.filter((d: any) =>
      d.Constructors?.some((c: any) => c.constructorId === s.Constructor.constructorId)
    );
    return {
      ...s.Constructor, ...info,
      position: s.position, points: s.points, wins: s.wins,
      drivers: teamDrivers
    };
  }) : constructors.map((c: any) => ({ ...c, position: '', points: '0', wins: '0', drivers: [] }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="page-controls">
        <div className="season-filter">
          <Calendar size={14} />
          <span>Season</span>
          <strong>{season}</strong>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {teamCards.map((team: any, i: number) => {
          const teamColor = getTeamColorByName(team.name);
          return (
            <div key={team.constructorId || i} className="card card-hover" style={{
              position: 'relative', overflow: 'hidden',
              borderLeft: `4px solid ${teamColor}`,
            }}>
              {/* Background gradient */}
              <div style={{
                position: 'absolute', top: 0, right: 0, width: '50%', height: '100%',
                background: `linear-gradient(135deg, transparent, ${teamColor}08)`,
                pointerEvents: 'none'
              }} />

              {/* Position */}
              {team.position && (
                <div style={{
                  position: 'absolute', top: 12, right: 12,
                  fontSize: 36, fontWeight: 800, color: teamColor, opacity: 0.2,
                  lineHeight: 1
                }}>
                  P{team.position}
                </div>
              )}

              {/* Team Icon */}
              <div style={{
                width: 48, height: 48, borderRadius: 10,
                background: `linear-gradient(135deg, ${teamColor}22, ${teamColor}08)`,
                border: `1px solid ${teamColor}33`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 700, marginBottom: 12,
                color: teamColor
              }}>
                {team.name?.substring(0, 2).toUpperCase()}
              </div>

              {/* Name */}
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 2, color: teamColor }}>
                {team.name}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>
                {team.nationality}
              </div>

              {/* Stats */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
                padding: '12px 0', borderTop: '1px solid var(--border-primary)',
                borderBottom: '1px solid var(--border-primary)', marginBottom: 12
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Position</div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{team.position || '—'}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Points</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent-blue)' }}>{team.points}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Wins</div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{team.wins}</div>
                </div>
              </div>

              {/* Drivers */}
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 6, letterSpacing: 0.5 }}>
                Drivers
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {team.drivers?.length > 0 ? team.drivers.map((d: any) => (
                  <div key={d.Driver.driverId} style={{
                    flex: 1, padding: '8px 10px', borderRadius: 6,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-primary)',
                    fontSize: 12
                  }}>
                    <div style={{ fontWeight: 600 }}>
                      {d.Driver.givenName} {d.Driver.familyName}
                    </div>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: 11, marginTop: 2 }}>
                      {d.points} pts • P{d.position}
                    </div>
                  </div>
                )) : (
                  <div style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>No driver data</div>
                )}
              </div>

              {team.url && (
                <a href={team.url} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    fontSize: 11, color: 'var(--accent-blue)', marginTop: 12
                  }}>
                  More info <ExternalLink size={10} />
                </a>
              )}
            </div>
          );
        })}
      </div>

      {teamCards.length === 0 && (
        <div className="empty-state">
          <Building2 size={48} />
          <h3>No Teams Found</h3>
          <p>Team information for {season} is not available.</p>
        </div>
      )}
    </div>
  );
}
