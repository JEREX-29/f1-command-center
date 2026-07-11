import { useState, useEffect } from 'react';
import { Calendar, Timer, Trophy } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { standingsApi } from '../api/standings';
import { useTheme } from '../context/ThemeContext';
import { getTeamColorByName } from '../api/f1Data';

export default function PitStops() {
  const { season } = useTheme();
  const [calendar, setCalendar] = useState<any[]>([]);
  const [selectedRound, setSelectedRound] = useState(0);
  const [pitStops, setPitStops] = useState<any[]>([]);
  const [raceData, setRaceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    standingsApi.getCalendar(season).then(cal => {
      setCalendar(cal);
      const now = new Date();
      const completed = cal.filter((r: any) => new Date(r.date) <= now);
      if (completed.length > 0) setSelectedRound(parseInt(completed[completed.length - 1].round));
      else if (cal.length > 0) setSelectedRound(parseInt(cal[0].round));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [season]);

  useEffect(() => {
    if (!selectedRound) return;
    Promise.all([
      standingsApi.getPitStops(season, selectedRound),
      standingsApi.getRaceResults(season, selectedRound).catch(() => null),
    ]).then(([ps, race]) => {
      setPitStops(ps);
      setRaceData(race);
    });
  }, [season, selectedRound]);

  const selectedRace = calendar.find((r: any) => parseInt(r.round) === selectedRound);

  // Process pit stop data
  const processedStops = pitStops.map((ps: any) => {
    const driverResult = raceData?.Results?.find((r: any) => r.Driver.driverId === ps.driverId);
    const duration = ps.duration ? parseFloat(ps.duration) : 0;
    return {
      ...ps,
      durationNum: duration,
      team: driverResult?.Constructor?.name || '',
      driverName: driverResult ? `${driverResult.Driver.givenName} ${driverResult.Driver.familyName}` : ps.driverId,
      driverCode: driverResult?.Driver?.code || ps.driverId?.substring(0, 3).toUpperCase(),
    };
  }).sort((a: any, b: any) => a.durationNum - b.durationNum);

  // Chart data: fastest stops
  const fastestStops = processedStops.filter(s => s.durationNum > 0 && s.durationNum < 60).slice(0, 15).map(s => ({
    driver: s.driverCode,
    duration: s.durationNum,
    color: getTeamColorByName(s.team),
    lap: s.lap,
    team: s.team,
  }));

  // Team average pit stop times
  const teamTimes: Record<string, { total: number; count: number; color: string }> = {};
  processedStops.forEach(s => {
    if (s.team && s.durationNum > 0 && s.durationNum < 60) {
      if (!teamTimes[s.team]) teamTimes[s.team] = { total: 0, count: 0, color: getTeamColorByName(s.team) };
      teamTimes[s.team].total += s.durationNum;
      teamTimes[s.team].count++;
    }
  });

  const teamAvgData = Object.entries(teamTimes)
    .map(([team, data]) => ({
      team: team.length > 12 ? team.substring(0, 12) + '…' : team,
      avg: +(data.total / data.count).toFixed(2),
      color: data.color,
    }))
    .sort((a, b) => a.avg - b.avg);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

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

      {/* Fastest pit stop highlight */}
      {fastestStops.length > 0 && (
        <div className="card" style={{ borderLeft: `3px solid var(--accent-green)` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Trophy size={24} style={{ color: 'var(--accent-yellow)' }} />
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Fastest Pit Stop – {selectedRace?.raceName}</div>
              <div style={{ fontSize: 22, fontWeight: 700, marginTop: 2 }}>
                {fastestStops[0].duration.toFixed(3)}s
                <span style={{ fontSize: 13, color: fastestStops[0].color, marginLeft: 8 }}>
                  {fastestStops[0].driver} • {fastestStops[0].team} • Lap {fastestStops[0].lap}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Fastest stops chart */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Fastest Pit Stops</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={fastestStops} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
              <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} domain={['dataMin - 0.5', 'dataMax + 0.5']} />
              <YAxis type="category" dataKey="driver" width={40} tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 8 }}
                formatter={(value: number) => [`${value.toFixed(3)}s`, 'Duration']} />
              <Bar dataKey="duration" radius={[0, 4, 4, 0]}>
                {fastestStops.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Team averages */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Team Average Pit Stop Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={teamAvgData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
              <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
              <YAxis type="category" dataKey="team" width={100} tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 8 }}
                formatter={(value: number) => [`${value.toFixed(3)}s`, 'Avg Duration']} />
              <Bar dataKey="avg" radius={[0, 4, 4, 0]}>
                {teamAvgData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* All stops table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-primary)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Timer size={16} /> All Pit Stops ({processedStops.length})
          </h3>
        </div>
        <div style={{ overflowX: 'auto', maxHeight: 400 }}>
          <table className="data-table">
            <thead>
              <tr><th>#</th><th>DRIVER</th><th>TEAM</th><th>LAP</th><th>STOP</th><th>DURATION</th></tr>
            </thead>
            <tbody>
              {processedStops.slice(0, 50).map((ps: any, i: number) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{i + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="team-color-bar" style={{ backgroundColor: getTeamColorByName(ps.team) }} />
                      <span style={{ fontWeight: 500 }}>{ps.driverName}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: getTeamColorByName(ps.team) }}>{ps.team}</td>
                  <td>{ps.lap}</td>
                  <td>{ps.stop}</td>
                  <td>
                    <span style={{
                      fontFamily: 'monospace', fontWeight: 600,
                      color: ps.durationNum < 25 ? 'var(--accent-green)' : ps.durationNum < 30 ? 'var(--accent-yellow)' : 'var(--accent-red)'
                    }}>
                      {ps.duration || '—'}s
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pitStops.length === 0 && (
        <div className="empty-state"><Timer size={48} /><h3>No Pit Stop Data</h3><p>Pit stop data for this round is not available.</p></div>
      )}
    </div>
  );
}
