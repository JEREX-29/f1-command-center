import { useState, useEffect } from 'react';
import { Calendar, GitCompare } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { standingsApi } from '../api/standings';
import { useTheme } from '../context/ThemeContext';
import { getTeamColorByName } from '../api/f1Data';

export default function HeadToHead() {
  const { season } = useTheme();
  const [standings, setStandings] = useState<any[]>([]);
  const [driver1, setDriver1] = useState('');
  const [driver2, setDriver2] = useState('');
  const [results1, setResults1] = useState<any[]>([]);
  const [results2, setResults2] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    standingsApi.getDriverStandings(season).then(data => {
      setStandings(data);
      if (data.length >= 2) {
        setDriver1(data[0].Driver.driverId);
        setDriver2(data[1].Driver.driverId);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [season]);

  useEffect(() => {
    if (!driver1 || !driver2) return;
    Promise.all([
      standingsApi.getDriverSeasonResults(season, driver1).catch(() => []),
      standingsApi.getDriverSeasonResults(season, driver2).catch(() => []),
    ]).then(([r1, r2]) => { setResults1(r1); setResults2(r2); });
  }, [season, driver1, driver2]);

  const d1 = standings.find((s: any) => s.Driver.driverId === driver1);
  const d2 = standings.find((s: any) => s.Driver.driverId === driver2);
  const color1 = d1 ? getTeamColorByName(d1.Constructors?.[0]?.name) : '#3b82f6';
  const color2 = d2 ? getTeamColorByName(d2.Constructors?.[0]?.name) : '#ef4444';

  // Compare stats
  const getStats = (d: any, results: any[]) => {
    if (!d) return { points: 0, wins: 0, podiums: 0, avgPos: 0, dnfs: 0, bestFinish: 20 };
    const positions = results.map(r => parseInt(r.Results?.[0]?.position) || 20);
    return {
      points: parseInt(d.points) || 0,
      wins: parseInt(d.wins) || 0,
      podiums: positions.filter(p => p <= 3).length,
      avgPos: positions.length > 0 ? +(positions.reduce((a, b) => a + b, 0) / positions.length).toFixed(1) : 0,
      dnfs: results.filter(r => r.Results?.[0]?.status && !r.Results[0].status.startsWith('Finished') && !r.Results[0].status.match(/^\+/)).length,
      bestFinish: positions.length > 0 ? Math.min(...positions) : 20,
    };
  };

  const stats1 = getStats(d1, results1);
  const stats2 = getStats(d2, results2);

  // Radar chart data
  const maxPoints = Math.max(stats1.points, stats2.points, 1);
  const radarData = [
    { stat: 'Points', d1: (stats1.points / maxPoints) * 100, d2: (stats2.points / maxPoints) * 100 },
    { stat: 'Wins', d1: stats1.wins * 20, d2: stats2.wins * 20 },
    { stat: 'Podiums', d1: stats1.podiums * 15, d2: stats2.podiums * 15 },
    { stat: 'Consistency', d1: stats1.avgPos > 0 ? (20 - stats1.avgPos) * 5 : 0, d2: stats2.avgPos > 0 ? (20 - stats2.avgPos) * 5 : 0 },
    { stat: 'Reliability', d1: Math.max(0, 100 - stats1.dnfs * 20), d2: Math.max(0, 100 - stats2.dnfs * 20) },
  ];

  // Race-by-race comparison
  const raceComparison = results1.map((r1: any) => {
    const r2Match = results2.find((r2: any) => r2.round === r1.round);
    return {
      race: r1.raceName?.replace(' Grand Prix', '').substring(0, 8),
      d1Pos: parseInt(r1.Results?.[0]?.position) || 20,
      d2Pos: r2Match ? parseInt(r2Match.Results?.[0]?.position) || 20 : 20,
    };
  });

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Driver selectors */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div className="season-filter">
          <Calendar size={14} /><span>Season</span><strong>{season}</strong>
        </div>
        <select className="select-control" value={driver1} onChange={e => setDriver1(e.target.value)}
          style={{ borderColor: color1 }}>
          {standings.map((s: any) => (
            <option key={s.Driver.driverId} value={s.Driver.driverId}>
              {s.Driver.givenName} {s.Driver.familyName}
            </option>
          ))}
        </select>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-tertiary)' }}>VS</span>
        <select className="select-control" value={driver2} onChange={e => setDriver2(e.target.value)}
          style={{ borderColor: color2 }}>
          {standings.map((s: any) => (
            <option key={s.Driver.driverId} value={s.Driver.driverId}>
              {s.Driver.givenName} {s.Driver.familyName}
            </option>
          ))}
        </select>
      </div>

      {/* Stat comparison cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
        {[
          { label: 'Points', v1: stats1.points, v2: stats2.points },
          { label: 'Wins', v1: stats1.wins, v2: stats2.wins },
          { label: 'Podiums', v1: stats1.podiums, v2: stats2.podiums },
          { label: 'Avg Position', v1: stats1.avgPos, v2: stats2.avgPos, lower: true },
          { label: 'Best Finish', v1: stats1.bestFinish, v2: stats2.bestFinish, lower: true },
          { label: 'DNFs', v1: stats1.dnfs, v2: stats2.dnfs, lower: true },
        ].map(stat => {
          const winner1 = stat.lower ? stat.v1 < stat.v2 : stat.v1 > stat.v2;
          const winner2 = stat.lower ? stat.v2 < stat.v1 : stat.v2 > stat.v1;
          return (
            <div key={stat.label} className="card" style={{ textAlign: 'center', padding: 12 }}>
              <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 8 }}>{stat.label}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: winner1 ? color1 : 'var(--text-secondary)' }}>{stat.v1}</span>
                <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>vs</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: winner2 ? color2 : 'var(--text-secondary)' }}>{stat.v2}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Radar */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Overall Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--border-primary)" />
              <PolarAngleAxis dataKey="stat" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
              <PolarRadiusAxis tick={false} domain={[0, 100]} />
              <Radar name={d1?.Driver.familyName || 'Driver 1'} dataKey="d1" stroke={color1} fill={color1} fillOpacity={0.2} strokeWidth={2} />
              <Radar name={d2?.Driver.familyName || 'Driver 2'} dataKey="d2" stroke={color2} fill={color2} fillOpacity={0.2} strokeWidth={2} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Race positions */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Race Positions Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={raceComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
              <XAxis dataKey="race" tick={{ fontSize: 9, fill: 'var(--text-tertiary)' }} angle={-45} textAnchor="end" height={60} />
              <YAxis reversed domain={[1, 20]} tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="d1Pos" name={d1?.Driver.familyName || 'D1'} fill={color1} radius={[3, 3, 0, 0]} />
              <Bar dataKey="d2Pos" name={d2?.Driver.familyName || 'D2'} fill={color2} radius={[3, 3, 0, 0]} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {standings.length === 0 && (
        <div className="empty-state">
          <GitCompare size={48} />
          <h3>No Data Available</h3>
          <p>Head to head comparison data for {season} is not available.</p>
        </div>
      )}
    </div>
  );
}
