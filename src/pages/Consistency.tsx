import { useState, useEffect } from 'react';
import { Calendar, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { standingsApi } from '../api/standings';
import { useTheme } from '../context/ThemeContext';
import { getTeamColorByName } from '../api/f1Data';

export default function Consistency() {
  const { season } = useTheme();
  const [standings, setStandings] = useState<any[]>([]);
  const [allResults, setAllResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      standingsApi.getDriverStandings(season).catch(() => []),
      standingsApi.getAllRaceResults(season).catch(() => []),
    ]).then(([std, results]) => {
      setStandings(std);
      setAllResults(results);
      setLoading(false);
    });
  }, [season]);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  // Calculate consistency metrics for each driver
  const driverConsistency = standings.slice(0, 10).map((s: any) => {
    const driverId = s.Driver.driverId;
    const positions: number[] = [];
    allResults.forEach((race: any) => {
      const result = race.Results?.find((r: any) => r.Driver.driverId === driverId);
      if (result) positions.push(parseInt(result.position) || 20);
    });

    const avg = positions.length > 0 ? positions.reduce((a, b) => a + b, 0) / positions.length : 0;
    const stdDev = positions.length > 1
      ? Math.sqrt(positions.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) / positions.length)
      : 0;
    const inPoints = positions.filter(p => p <= 10).length;
    const podiums = positions.filter(p => p <= 3).length;

    return {
      driver: s.Driver.familyName,
      driverId,
      team: s.Constructors?.[0]?.name,
      avgPosition: +avg.toFixed(1),
      stdDev: +stdDev.toFixed(2),
      consistency: positions.length > 0 ? +(100 - stdDev * 10).toFixed(1) : 0,
      inPointsRate: positions.length > 0 ? +((inPoints / positions.length) * 100).toFixed(0) : 0,
      podiumRate: positions.length > 0 ? +((podiums / positions.length) * 100).toFixed(0) : 0,
      races: positions.length,
      positions,
    };
  });

  // Build line chart data: position per race for top 5
  const lineData = allResults.map((race: any, raceIdx: number) => {
    const point: any = { race: race.raceName?.replace(' Grand Prix', '').substring(0, 8) };
    driverConsistency.slice(0, 5).forEach(dc => {
      const result = race.Results?.find((r: any) => r.Driver.driverId === dc.driverId);
      point[dc.driver] = result ? parseInt(result.position) || null : null;
    });
    return point;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="page-controls">
        <div className="season-filter">
          <Calendar size={14} /><span>Season</span><strong>{season}</strong>
        </div>
      </div>

      {/* Consistency Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-primary)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={18} /> Driver Consistency Rankings
          </h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>RANK</th>
                <th>DRIVER</th>
                <th>TEAM</th>
                <th>AVG POS</th>
                <th>STD DEV</th>
                <th>CONSISTENCY</th>
                <th>IN POINTS %</th>
                <th>PODIUM %</th>
                <th>RACES</th>
              </tr>
            </thead>
            <tbody>
              {driverConsistency.sort((a, b) => b.consistency - a.consistency).map((dc, i) => {
                const teamColor = getTeamColorByName(dc.team);
                return (
                  <tr key={dc.driverId}>
                    <td style={{ fontWeight: 700 }}>{i + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="team-color-bar" style={{ backgroundColor: teamColor }} />
                        <span style={{ fontWeight: 600 }}>{dc.driver}</span>
                      </div>
                    </td>
                    <td style={{ color: teamColor, fontSize: 12 }}>{dc.team}</td>
                    <td style={{ fontWeight: 600 }}>{dc.avgPosition}</td>
                    <td>{dc.stdDev}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--bg-secondary)', maxWidth: 80 }}>
                          <div style={{ height: '100%', borderRadius: 3, width: `${Math.max(0, dc.consistency)}%`, background: dc.consistency >= 80 ? 'var(--accent-green)' : dc.consistency >= 60 ? 'var(--accent-yellow)' : 'var(--accent-red)' }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{dc.consistency}%</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-blue">{dc.inPointsRate}%</span>
                    </td>
                    <td>
                      <span className="badge badge-green">{dc.podiumRate}%</span>
                    </td>
                    <td>{dc.races}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Position per race chart */}
      <div className="card">
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Position Per Race (Top 5)</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
            <XAxis dataKey="race" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} angle={-45} textAnchor="end" height={60} />
            <YAxis reversed domain={[1, 20]} tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 8, fontSize: 12 }} />
            {driverConsistency.slice(0, 5).map((dc) => (
              <Line key={dc.driver} type="monotone" dataKey={dc.driver} stroke={getTeamColorByName(dc.team)}
                strokeWidth={2} dot={{ r: 3 }} connectNulls />
            ))}
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {standings.length === 0 && (
        <div className="empty-state">
          <TrendingUp size={48} /><h3>No Data Available</h3>
          <p>Consistency data for {season} is not available.</p>
        </div>
      )}
    </div>
  );
}
