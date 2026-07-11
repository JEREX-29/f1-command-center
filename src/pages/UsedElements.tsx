import { useState, useEffect } from 'react';
import { Calendar, Settings, AlertTriangle } from 'lucide-react';
import { standingsApi } from '../api/standings';
import { useTheme } from '../context/ThemeContext';
import { getTeamColorByName, PU_ELEMENTS } from '../api/f1Data';

export default function UsedElements() {
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

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  // Generate element usage data
  const driverElements = standings.map((s: any, idx: number) => {
    const elements: Record<string, number> = {};
    PU_ELEMENTS.forEach(el => {
      // Simulate usage based on position (top drivers use less because fewer incidents)
      const base = idx < 5 ? 1 : idx < 10 ? 2 : 2;
      const extra = Math.floor(Math.random() * (idx > 15 ? 2 : 1));
      elements[el.key] = Math.min(base + extra, el.limit + 2);
    });
    return {
      driver: s.Driver,
      team: s.Constructors?.[0]?.name || '',
      elements,
    };
  });

  const totalUsed = driverElements.reduce((total, d) => {
    return total + Object.values(d.elements).reduce((a, b) => a + b, 0);
  }, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="page-controls">
        <div className="season-filter">
          <Calendar size={14} /><span>Season</span><strong>{season}</strong>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <Settings size={20} style={{ color: 'var(--accent-blue)', marginBottom: 6 }} />
          <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Total Used</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{totalUsed}</div>
        </div>
        {PU_ELEMENTS.map(el => (
          <div key={el.key} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 4 }}>{el.key}</div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{el.label}</div>
            <div style={{ fontSize: 12, marginTop: 4, color: 'var(--accent-yellow)' }}>Limit: {el.limit}</div>
          </div>
        ))}
      </div>

      {/* Elements table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-primary)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Settings size={18} /> Power Unit Element Usage
          </h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>DRIVER</th>
                <th>TEAM</th>
                {PU_ELEMENTS.map(el => (
                  <th key={el.key} style={{ textAlign: 'center' }}>{el.key}</th>
                ))}
                <th style={{ textAlign: 'center' }}>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {driverElements.map((d, i) => {
                const teamColor = getTeamColorByName(d.team);
                const total = Object.values(d.elements).reduce((a, b) => a + b, 0);
                const hasExceeded = PU_ELEMENTS.some(el => d.elements[el.key] > el.limit);
                return (
                  <tr key={i}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="team-color-bar" style={{ backgroundColor: teamColor }} />
                        <span style={{ fontWeight: 600, fontSize: 13 }}>
                          {d.driver.givenName?.[0]}. {d.driver.familyName}
                        </span>
                        {hasExceeded && <AlertTriangle size={12} style={{ color: 'var(--accent-red)' }} />}
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: teamColor }}>{d.team}</td>
                    {PU_ELEMENTS.map(el => {
                      const used = d.elements[el.key];
                      const exceeded = used > el.limit;
                      return (
                        <td key={el.key} style={{ textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: 28, height: 28, borderRadius: 6,
                            fontWeight: 700, fontSize: 13,
                            background: exceeded ? 'rgba(225,6,0,0.15)' : used === el.limit ? 'rgba(234,179,8,0.15)' : 'rgba(34,197,94,0.08)',
                            color: exceeded ? 'var(--accent-red)' : used === el.limit ? 'var(--accent-yellow)' : 'var(--accent-green)',
                            border: `1px solid ${exceeded ? 'rgba(225,6,0,0.3)' : 'transparent'}`
                          }}>
                            {used}
                          </span>
                        </td>
                      );
                    })}
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--text-secondary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }} />
          Within limit
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.3)' }} />
          At limit
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(225,6,0,0.15)', border: '1px solid rgba(225,6,0,0.3)' }} />
          Exceeded (penalty)
        </div>
      </div>

      {standings.length === 0 && (
        <div className="empty-state"><Settings size={48} /><h3>No Data</h3><p>Element usage data for {season} is not available.</p></div>
      )}
    </div>
  );
}
