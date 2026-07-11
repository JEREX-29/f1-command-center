import { useState, useEffect } from 'react';
import { Calendar, Skull, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { standingsApi } from '../api/standings';
import { useTheme } from '../context/ThemeContext';
import { getTeamColorByName } from '../api/f1Data';

export default function DestructorsChampionship() {
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

  // Generate crash/incident data based on driver standings
  const destructorData = standings.map((s: any, idx: number) => {
    const incidents = Math.max(0, Math.floor(Math.random() * 5) + (idx > 10 ? 2 : 0));
    const costPerIncident = 250000 + Math.floor(Math.random() * 500000);
    const totalCost = incidents * costPerIncident;
    return {
      driver: `${s.Driver.givenName} ${s.Driver.familyName}`,
      driverCode: s.Driver.code || s.Driver.familyName?.substring(0, 3).toUpperCase(),
      team: s.Constructors?.[0]?.name || '',
      incidents,
      totalCost,
      dnfs: Math.floor(Math.random() * 3),
      penalties: Math.floor(Math.random() * 4),
      teamColor: getTeamColorByName(s.Constructors?.[0]?.name),
    };
  }).sort((a, b) => b.totalCost - a.totalCost);

  const totalSeasonCost = destructorData.reduce((a, b) => a + b.totalCost, 0);

  // Chart data
  const chartData = destructorData.slice(0, 12).map(d => ({
    driver: d.driverCode,
    cost: +(d.totalCost / 1000000).toFixed(2),
    color: d.teamColor,
  }));

  // Team totals
  const teamCosts: Record<string, { cost: number; color: string; incidents: number }> = {};
  destructorData.forEach(d => {
    if (!teamCosts[d.team]) teamCosts[d.team] = { cost: 0, color: d.teamColor, incidents: 0 };
    teamCosts[d.team].cost += d.totalCost;
    teamCosts[d.team].incidents += d.incidents;
  });
  const teamChartData = Object.entries(teamCosts)
    .map(([team, data]) => ({ team: team.length > 12 ? team.substring(0, 12) : team, cost: +(data.cost / 1000000).toFixed(2), color: data.color, incidents: data.incidents }))
    .sort((a, b) => b.cost - a.cost);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="page-controls">
        <div className="season-filter">
          <Calendar size={14} /><span>Season</span><strong>{season}</strong>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <div className="card" style={{ textAlign: 'center', borderTop: '3px solid var(--accent-red)' }}>
          <DollarSign size={20} style={{ color: 'var(--accent-red)', marginBottom: 6 }} />
          <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Total Season Damage</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>${(totalSeasonCost / 1000000).toFixed(1)}M</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <Skull size={20} style={{ color: 'var(--accent-orange)', marginBottom: 6 }} />
          <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Total Incidents</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{destructorData.reduce((a, b) => a + b.incidents, 0)}</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 6 }}>Most Costly</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: destructorData[0]?.teamColor }}>{destructorData[0]?.driver}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>${(destructorData[0]?.totalCost / 1000000).toFixed(2)}M</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Driver costs */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Damage Costs by Driver (Millions $)</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
              <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
              <YAxis type="category" dataKey="driver" width={40} tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 8 }}
                formatter={(value: number) => [`$${value}M`, 'Cost']} />
              <Bar dataKey="cost" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Team costs */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Damage Costs by Team (Millions $)</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={teamChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
              <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
              <YAxis type="category" dataKey="team" width={100} tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 8 }}
                formatter={(value: number) => [`$${value}M`, 'Cost']} />
              <Bar dataKey="cost" radius={[0, 4, 4, 0]}>
                {teamChartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Full table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-primary)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Skull size={18} /> Destructors Championship Standings
          </h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr><th>POS</th><th>DRIVER</th><th>TEAM</th><th>INCIDENTS</th><th>DNFs</th><th>PENALTIES</th><th>DAMAGE COST</th></tr>
            </thead>
            <tbody>
              {destructorData.map((d, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 700 }}>{i + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="team-color-bar" style={{ backgroundColor: d.teamColor }} />
                      <span style={{ fontWeight: 600 }}>{d.driver}</span>
                    </div>
                  </td>
                  <td style={{ color: d.teamColor, fontSize: 12 }}>{d.team}</td>
                  <td><span className="badge badge-red">{d.incidents}</span></td>
                  <td>{d.dnfs}</td>
                  <td>{d.penalties}</td>
                  <td style={{ fontWeight: 700, fontFamily: 'monospace', color: d.totalCost > 1000000 ? 'var(--accent-red)' : 'var(--accent-yellow)' }}>
                    ${(d.totalCost / 1000).toFixed(0)}K
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
