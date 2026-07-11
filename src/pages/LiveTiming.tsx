import { useState, useEffect } from 'react';
import { Play, Eye, EyeOff, Link2, Thermometer, Droplets, Wind, Gauge, CloudRain, Radio } from 'lucide-react';
import { openf1 } from '../api/openf1';
import { useTheme } from '../context/ThemeContext';
import { getTyreColor, getTyreLabel } from '../api/f1Data';

export default function LiveTiming() {
  const { season, spoilerProtection, toggleSpoilerProtection } = useTheme();
  const [session, setSession] = useState<any>(null);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [stints, setStints] = useState<any[]>([]);
  const [weather, setWeather] = useState<any>(null);
  const [raceControl, setRaceControl] = useState<any[]>([]);
  const [teamRadio, setTeamRadio] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'timing' | 'stints'>('leaderboard');
  const [revealed, setRevealed] = useState(false);
  const [positions, setPositions] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const sessions = await openf1.getSessions(season);
        if (!sessions || sessions.length === 0) {
          setLoading(false);
          return;
        }
        // Get the latest race session
        const raceSessions = sessions.filter((s: any) => s.session_type === 'Race');
        const latest = raceSessions.length > 0
          ? raceSessions[raceSessions.length - 1]
          : sessions[sessions.length - 1];
        setSession(latest);

        if (latest?.session_key) {
          const [drv, st, wth, rc, tr, pos] = await Promise.all([
            openf1.getDrivers(latest.session_key).catch(() => []),
            openf1.getStints(latest.session_key).catch(() => []),
            openf1.getWeather(latest.session_key).catch(() => []),
            openf1.getRaceControl(latest.session_key).catch(() => []),
            openf1.getTeamRadio(latest.session_key).catch(() => []),
            openf1.getPositions(latest.session_key).catch(() => []),
          ]);
          setDrivers(drv);
          setStints(st);
          setWeather(wth?.length > 0 ? wth[wth.length - 1] : null);
          setRaceControl(rc);
          setTeamRadio(tr.slice(-20));
          setPositions(pos);
        }
      } catch (e) {
        console.error('Failed to load live timing data:', e);
      }
      setLoading(false);
    }
    loadData();
  }, [season]);

  // Build leaderboard from positions
  const getLatestPositions = () => {
    if (!positions.length && !drivers.length) return [];
    const driverMap = new Map<number, any>();
    drivers.forEach((d: any) => {
      driverMap.set(d.driver_number, d);
    });

    // Get the final position for each driver
    const finalPositions = new Map<number, number>();
    positions.forEach((p: any) => {
      finalPositions.set(p.driver_number, p.position);
    });

    // Build leaderboard
    const board = drivers.map((d: any) => ({
      ...d,
      position: finalPositions.get(d.driver_number) || 99,
      stints: stints.filter((s: any) => s.driver_number === d.driver_number),
    }));

    board.sort((a: any, b: any) => a.position - b.position);
    return board;
  };

  const leaderboard = getLatestPositions();
  const sessionName = session?.session_name || 'Race';
  const gpName = session?.meeting_name || session?.location || 'Grand Prix';
  const isFinished = session?.status === 'Finished' || session?.status === 'Finalised';
  const totalLaps = session?.total_laps || '?';

  if (loading) {
    return <div className="loading-spinner"><div className="spinner" /></div>;
  }

  if (!session) {
    return (
      <div className="empty-state">
        <Radio size={48} />
        <h3>No Session Data Available</h3>
        <p>No live timing data found for the {season} season.</p>
      </div>
    );
  }

  // Spoiler protection overlay
  if (spoilerProtection && isFinished && !revealed) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Session Header */}
        <SessionHeader gpName={gpName} sessionName={sessionName} isFinished={isFinished}
          totalLaps={totalLaps} weather={weather} />

        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
          <div style={{ textAlign: 'center' }}>
            <Link2 size={48} style={{ color: 'var(--text-tertiary)', marginBottom: 16 }} />
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Anti-Spoiler Protection</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
              This session has concluded. The final results have been hidden to prevent spoilers.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => setRevealed(true)}>
                <Play size={14} /> Replay
              </button>
              <button className="btn btn-secondary" onClick={() => setRevealed(true)}>
                <Eye size={14} /> Reveal Results
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Session Header */}
      <SessionHeader gpName={gpName} sessionName={sessionName} isFinished={isFinished}
        totalLaps={totalLaps} weather={weather} />

      {/* Main content: Leaderboard + Right sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
        {/* Leaderboard */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Tab bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border-primary)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>Leaderboard</h3>
            <div className="tab-bar">
              {(['leaderboard', 'timing', 'stints'] as const).map(tab => (
                <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                  style={{ textTransform: 'capitalize' }}>
                  {tab === 'leaderboard' ? 'Leaderboard' : tab === 'timing' ? 'Timing' : 'Stints'}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            {activeTab === 'stints' ? (
              <StintsView leaderboard={leaderboard} />
            ) : (
              <TimingView leaderboard={leaderboard} showTiming={activeTab === 'timing'} />
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Best Lap Benchmarks */}
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                ⏱ Best Lap Benchmarks
              </h3>
            </div>
            <div style={{ padding: 16 }}>
              <BenchmarkItem label="SESSION BEST" time="—" driver={leaderboard[0]?.name_acronym || '—'} color="var(--accent-cyan)" />
              <BenchmarkItem label="PREVIOUS RACE EDITION" time="—" driver="Previous Season" color="var(--accent-green)" />
              <BenchmarkItem label="LAP RECORD" time="—" driver="Record Holder" color="var(--accent-yellow)" />
              <BenchmarkItem label="TRACK RECORD" time="—" driver="Track Record" color="var(--accent-orange)" />
            </div>
          </div>

          {/* Race Control */}
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                📡 Race Control
              </h3>
              <span className="badge badge-blue">{raceControl.length}</span>
            </div>
            <div style={{ maxHeight: 200, overflowY: 'auto', padding: '8px 0' }}>
              {raceControl.length === 0 ? (
                <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 12 }}>
                  No race control messages
                </div>
              ) : (
                raceControl.slice(-10).reverse().map((rc: any, i: number) => (
                  <div key={i} style={{ padding: '8px 16px', borderBottom: '1px solid var(--border-primary)', fontSize: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{
                        color: rc.category === 'Flag' ? 'var(--accent-yellow)' :
                          rc.category === 'SafetyCar' ? 'var(--accent-orange)' : 'var(--accent-blue)',
                        fontWeight: 600
                      }}>
                        {rc.flag || rc.category || 'Info'}
                      </span>
                      <span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>
                        {rc.date ? new Date(rc.date).toLocaleTimeString() : ''}
                      </span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>{rc.message}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Team Radio */}
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                🎙 Team Radio
              </h3>
              <span className="badge badge-blue">{teamRadio.length}</span>
            </div>
            <div style={{ maxHeight: 240, overflowY: 'auto' }}>
              {teamRadio.length === 0 ? (
                <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 12 }}>
                  No team radio messages
                </div>
              ) : (
                teamRadio.slice(-8).reverse().map((tr: any, i: number) => {
                  const driver = drivers.find((d: any) => d.driver_number === tr.driver_number);
                  return (
                    <div key={i} style={{
                      padding: '10px 16px', borderBottom: '1px solid var(--border-primary)',
                      display: 'flex', alignItems: 'center', gap: 12
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'var(--bg-secondary)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 600
                      }}>
                        {driver?.name_acronym || tr.driver_number}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>
                          {driver?.full_name || `Driver #${tr.driver_number}`}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                          {tr.date ? new Date(tr.date).toLocaleTimeString() : ''}
                        </div>
                      </div>
                      {tr.recording_url && (
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px' }}
                          onClick={() => {
                            const audio = new Audio(tr.recording_url);
                            audio.play().catch(() => {});
                          }}
                        >
                          <Play size={12} />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-components
function SessionHeader({ gpName, sessionName, isFinished, totalLaps, weather }: any) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 12
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>{gpName}</h1>
          <span className={`badge ${isFinished ? 'badge-green' : 'badge-red'}`}>
            {isFinished ? '✓ FINISHED' : '● LIVE'}
          </span>
          {isFinished && (
            <button className="btn btn-primary" style={{ padding: '4px 14px', fontSize: 12 }}>
              <Play size={12} /> REPLAY
            </button>
          )}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2, textTransform: 'uppercase' }}>
          {sessionName}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        {/* Laps */}
        <div style={{ textAlign: 'center', padding: '6px 14px', border: '1px solid var(--border-primary)', borderRadius: 8, background: 'var(--bg-card)' }}>
          <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>LAPS</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{totalLaps}<span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}> / {totalLaps}</span></div>
        </div>

        {/* Weather strip */}
        {weather && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16, padding: '6px 14px',
            border: '1px solid var(--border-primary)', borderRadius: 8, background: 'var(--bg-card)',
            fontSize: 12
          }}>
            <WeatherItem icon={<Thermometer size={12} />} label="AIR" value={`${weather.air_temperature || '—'}°c`} />
            <WeatherItem icon={<Thermometer size={12} color="var(--accent-red)" />} label="TRACK" value={`${weather.track_temperature || '—'}°c`} />
            <WeatherItem icon={<Droplets size={12} />} label="HUM" value={`${weather.humidity || '—'}%`} />
            <WeatherItem icon={<Wind size={12} />} label="WIND" value={`${weather.wind_speed || '—'} m/s`} />
            <WeatherItem icon={<Gauge size={12} />} label="PRESS" value={`${weather.pressure || '—'} hPa`} />
            <WeatherItem icon={<CloudRain size={12} />} label="RAIN" value={`${weather.rainfall || '0'} mm`} />
          </div>
        )}
      </div>
    </div>
  );
}

function WeatherItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 9, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontWeight: 600 }}>
        {icon} {value}
      </div>
    </div>
  );
}

function BenchmarkItem({ label, time, driver, color }: { label: string; time: string; driver: string; color: string }) {
  return (
    <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border-primary)' }}>
      <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color, lineHeight: 1 }}>{time}</div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{driver}</div>
    </div>
  );
}

function TimingView({ leaderboard, showTiming }: { leaderboard: any[]; showTiming: boolean }) {
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th style={{ width: 40 }}>POS.</th>
          <th>DRIVER</th>
          <th>LAPS</th>
          <th>PIT</th>
          <th>TYRE</th>
          {showTiming && <th>BEST LAP</th>}
          {showTiming && <th>GAP</th>}
          {showTiming && <th>INT.</th>}
        </tr>
      </thead>
      <tbody>
        {leaderboard.slice(0, 20).map((d: any, i: number) => {
          const lastStint = d.stints?.[d.stints.length - 1];
          const compound = lastStint?.compound || '';
          return (
            <tr key={d.driver_number || i}>
              <td style={{ fontWeight: 700 }}>{d.position}</td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 3, height: 20, borderRadius: 2,
                    background: d.team_colour ? `#${d.team_colour}` : 'var(--text-tertiary)'
                  }} />
                  <span style={{ fontWeight: 600 }}>{d.name_acronym || d.broadcast_name || '—'}</span>
                </div>
              </td>
              <td>{lastStint ? (lastStint.lap_end || '—') : '—'}</td>
              <td>{d.stints?.filter((s: any) => s.stint_number > 1).length || 0}</td>
              <td>
                {compound && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 22, height: 22, borderRadius: '50%',
                    border: `2px solid ${getTyreColor(compound)}`,
                    fontSize: 10, fontWeight: 700,
                    color: getTyreColor(compound),
                    background: 'transparent'
                  }}>
                    {getTyreLabel(compound)}
                  </span>
                )}
              </td>
              {showTiming && <td style={{ fontFamily: 'monospace' }}>—</td>}
              {showTiming && <td style={{ fontFamily: 'monospace' }}>—</td>}
              {showTiming && <td style={{ fontFamily: 'monospace' }}>—</td>}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function StintsView({ leaderboard }: { leaderboard: any[] }) {
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th style={{ width: 40 }}>POS.</th>
          <th>DRIVER</th>
          <th>LAPS</th>
          <th>PIT</th>
          <th>TYRE</th>
          <th>STINT HISTORY</th>
        </tr>
      </thead>
      <tbody>
        {leaderboard.slice(0, 20).map((d: any, i: number) => {
          const lastStint = d.stints?.[d.stints.length - 1];
          const compound = lastStint?.compound || '';
          return (
            <tr key={d.driver_number || i}>
              <td style={{ fontWeight: 700 }}>{d.position}</td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 3, height: 20, borderRadius: 2,
                    background: d.team_colour ? `#${d.team_colour}` : 'var(--text-tertiary)'
                  }} />
                  <span style={{ fontWeight: 600 }}>{d.name_acronym || '—'}</span>
                </div>
              </td>
              <td>{lastStint?.lap_end || '—'}</td>
              <td>{d.stints?.filter((s: any) => s.stint_number > 1).length || 0}</td>
              <td>
                {compound && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 22, height: 22, borderRadius: '50%',
                    border: `2px solid ${getTyreColor(compound)}`,
                    fontSize: 10, fontWeight: 700,
                    color: getTyreColor(compound),
                  }}>
                    {getTyreLabel(compound)}
                  </span>
                )}
              </td>
              <td>
                <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  {(d.stints || []).map((stint: any, si: number) => {
                    const laps = (stint.lap_end || 0) - (stint.lap_start || 0) + 1;
                    const maxLaps = 60;
                    const width = Math.max(40, (laps / maxLaps) * 200);
                    return (
                      <div key={si} style={{
                        height: 24, width,
                        background: getTyreColor(stint.compound),
                        borderRadius: 3,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 600,
                        color: stint.compound?.toUpperCase() === 'HARD' ? '#000' : '#000',
                        opacity: 0.9
                      }}>
                        {stint.compound?.toUpperCase() === 'SOFT' ? 'SOFT' :
                         stint.compound?.toUpperCase() === 'MEDIUM' ? 'MED' :
                         stint.compound?.toUpperCase() === 'HARD' ? 'HARD' :
                         stint.compound?.substring(0, 3).toUpperCase()}
                        <span style={{ marginLeft: 4, opacity: 0.7 }}>{laps > 0 ? `${laps} laps` : ''}</span>
                      </div>
                    );
                  })}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
