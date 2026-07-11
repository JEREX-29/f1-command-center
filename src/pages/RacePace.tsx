import { useState, useEffect } from 'react';
import { Calendar, Gauge } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { standingsApi } from '../api/standings';
import { useTheme } from '../context/ThemeContext';
import { getTeamColorByName } from '../api/f1Data';

export default function RacePace() {
  const { season } = useTheme();
  const [standings, setStandings] = useState<any[]>([]);
  const [calendar, setCalendar] = useState<any[]>([]);
  const [selectedRound, setSelectedRound] = useState(0);
  const [raceResults, setRaceResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      standingsApi.getDriverStandings(season).catch(() => []),
      standingsApi.getCalendar(season).catch(() => []),
    ]).then(([std, cal]) => {
      setStandings(std);
      setCalendar(cal);
      const now = new Date();
      const completed = cal.filter((r: any) => new Date(r.date) <= now);
      if (completed.length > 0) setSelectedRound(parseInt(completed[completed.length - 1].round));
      else if (cal.length > 0) setSelectedRound(parseInt(cal[0].round));
      setLoading(false);
    });
  }, [season]);

  useEffect(() => {
    if (!selectedRound) return;
    standingsApi.getRaceResults(season, selectedRound)
      .then(setRaceResults)
      .catch(() => setRaceResults(null));
  }, [season, selectedRound]);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  const selectedRace = calendar.find((r: any) => parseInt(r.round) === selectedRound);

  const paceData = raceResults?.Results?.slice(0, 15).map((r: any) => ({
    driver: r.Driver.code || r.Driver.familyName?.substring(0, 3).toUpperCase(),
    team: r.Constructor?.name,
    position: parseInt(r.position),
    laps: parseInt(r.laps) || 0,
    points: parseInt(r.points) || 0,
    status: r.status,
    color: getTeamColorByName(r.Constructor?.name),
  })) || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div className="season-filter">
          <Calendar size={14} /><span>Season</span><strong>{season}</strong>
        </div>
        <select className="select-control" value={selectedRound} onChange={e => setSelectedRound(parseInt(e.target.value))}>
          {calendar.map((r: any) => (
            <option key={r.round} value={r.round}>{r.raceName?.replace(' Grand Prix', '')}</option>
          ))}
        </select>
      </div>

      {selectedRace && (
        <div className="card" style={{ padding: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
            {selectedRace.raceName} – Race Pace Analysis
          </h2>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {selectedRace.Circuit?.circuitName} • {new Date(selectedRace.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      )}

      <div className="card">
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Points Scored</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={paceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
            <XAxis dataKey="driver" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 8 }} />
            <Bar dataKey="points" radius={[4, 4, 0, 0]}>
              {paceData.map((entry: any, i: number) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-primary)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Gauge size={16} /> Race Pace Summary
          </h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr><th>POS</th><th>DRIVER</th><th>TEAM</th><th>LAPS</th><th>STATUS</th><th>POINTS</th></tr>
            </thead>
            <tbody>
              {paceData.map((d: any, i: number) => (
                <tr key={i}>
                  <td style={{ fontWeight: 700 }}>{d.position}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="team-color-bar" style={{ backgroundColor: d.color }} />
                      <span style={{ fontWeight: 600 }}>{d.driver}</span>
                    </div>
                  </td>
                  <td style={{ color: d.color, fontSize: 12 }}>{d.team}</td>
                  <td>{d.laps}</td>
                  <td><span className={`badge ${d.status === 'Finished' || d.status?.startsWith('+') ? 'badge-green' : 'badge-red'}`}>{d.status}</span></td>
                  <td style={{ fontWeight: 600 }}>{d.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {paceData.length === 0 && (
        <div className="empty-state"><Gauge size={48} /><h3>No Race Data</h3><p>Race pace data for this round is not available.</p></div>
      )}
    </div>
  );
}
