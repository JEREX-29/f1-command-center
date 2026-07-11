import { useState, useEffect } from 'react';
import { Calendar, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { standingsApi } from '../api/standings';
import { useTheme } from '../context/ThemeContext';
import { getTeamColorByName } from '../api/f1Data';

export default function DriverStats() {
  const { season } = useTheme();
  const [standings, setStandings] = useState<any[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  const [driverResults, setDriverResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    standingsApi.getDriverStandings(season).then(data => {
      setStandings(data);
      if (data.length > 0 && !selectedDriver) {
        setSelectedDriver(data[0].Driver.driverId);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [season]);

  useEffect(() => {
    if (!selectedDriver) return;
    standingsApi.getDriverSeasonResults(season, selectedDriver)
      .then(setDriverResults)
      .catch(() => setDriverResults([]));
  }, [season, selectedDriver]);

  const currentDriver = standings.find((s: any) => s.Driver.driverId === selectedDriver);
  const teamColor = currentDriver ? getTeamColorByName(currentDriver.Constructors?.[0]?.name) : '#2563eb';

  // Build chart data
  const positionData = driverResults.map((race: any) => ({
    name: race.raceName?.replace(' Grand Prix', '').substring(0, 10),
    position: parseInt(race.Results?.[0]?.position) || 20,
    points: parseInt(race.Results?.[0]?.points) || 0,
  }));

  const pointsAccum = positionData.reduce((acc: any[], item, i) => {
    const prev = i > 0 ? acc[i - 1].total : 0;
    acc.push({ ...item, total: prev + item.points });
    return acc;
  }, []);

  // Position distribution
  const posDistribution: Record<string, number> = {};
  positionData.forEach(d => {
    const bucket = d.position <= 3 ? 'Podium' : d.position <= 10 ? 'Points' : 'Outside Points';
    posDistribution[bucket] = (posDistribution[bucket] || 0) + 1;
  });
  const pieData = Object.entries(posDistribution).map(([name, value]) => ({ name, value }));
  const PIE_COLORS = ['#22c55e', '#3b82f6', '#6b7280'];

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
        <select className="select-control" value={selectedDriver}
          onChange={e => setSelectedDriver(e.target.value)}>
          {standings.map((s: any) => (
            <option key={s.Driver.driverId} value={s.Driver.driverId}>
              {s.Driver.givenName} {s.Driver.familyName}
            </option>
          ))}
        </select>
      </div>

      {currentDriver && (
        <>
          {/* Driver summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
            {[
              { label: 'Position', value: `P${currentDriver.position}` },
              { label: 'Points', value: currentDriver.points },
              { label: 'Wins', value: currentDriver.wins },
              { label: 'Races', value: driverResults.length },
              { label: 'Team', value: currentDriver.Constructors?.[0]?.name },
            ].map(stat => (
              <div key={stat.label} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 4 }}>{stat.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: stat.label === 'Team' ? teamColor : 'var(--text-primary)' }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
            {/* Points progression */}
            <div className="card">
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Points Progression</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={pointsAccum}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} angle={-45} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="total" stroke={teamColor} strokeWidth={2} dot={{ fill: teamColor, r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Finish distribution */}
            <div className="card">
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Finish Distribution</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {pieData.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 8 }}>
                {pieData.map((item, idx) => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: PIE_COLORS[idx] }} />
                    {item.name} ({item.value})
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Race positions chart */}
          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Race Finishing Positions</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={positionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} angle={-45} textAnchor="end" height={60} />
                <YAxis reversed tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} domain={[1, 20]} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="position" fill={teamColor} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {standings.length === 0 && (
        <div className="empty-state">
          <BarChart3 size={48} />
          <h3>No Data Available</h3>
          <p>Driver statistics for {season} are not available.</p>
        </div>
      )}
    </div>
  );
}
