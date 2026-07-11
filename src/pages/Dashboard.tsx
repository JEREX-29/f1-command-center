import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Zap, DollarSign, Settings, Wrench, ArrowUpRight, ChevronRight } from 'lucide-react';
import { standingsApi } from '../api/standings';
import { useTheme } from '../context/ThemeContext';
import { getTeamColorByName, getDriverFlag, getCountryFlag } from '../api/f1Data';

export default function Dashboard() {
  const { season } = useTheme();
  const [driverStandings, setDriverStandings] = useState<any[]>([]);
  const [constructorStandings, setConstructorStandings] = useState<any[]>([]);
  const [calendar, setCalendar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      standingsApi.getDriverStandings(season).catch(() => []),
      standingsApi.getConstructorStandings(season).catch(() => []),
      standingsApi.getCalendar(season).catch(() => []),
    ]).then(([ds, cs, cal]) => {
      setDriverStandings(ds);
      setConstructorStandings(cs);
      setCalendar(cal);
      setLoading(false);
    });
  }, [season]);

  // Calculate next race
  const now = new Date();
  const nextRace = calendar.find(r => new Date(r.date + 'T' + (r.time || '00:00:00Z')) > now);
  const completedRaces = calendar.filter(r => new Date(r.date + 'T' + (r.time || '00:00:00Z')) <= now).length;
  const seasonProgress = calendar.length > 0 ? ((completedRaces / calendar.length) * 100).toFixed(1) : '0';

  // Countdown
  const [countdown, setCountdown] = useState({ days: 0, hrs: 0, mins: 0, sec: 0 });
  useEffect(() => {
    if (!nextRace) return;
    const target = new Date(nextRace.date + 'T' + (nextRace.time || '14:00:00Z'));
    const tick = () => {
      const diff = Math.max(0, target.getTime() - Date.now());
      setCountdown({
        days: Math.floor(diff / 86400000),
        hrs: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        sec: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [nextRace]);

  if (loading) {
    return <div className="loading-spinner"><div className="spinner" /></div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Season Filter */}
      <div className="page-controls">
        <div className="season-filter">
          <Calendar size={14} />
          <span>Season</span>
          <strong>{season}</strong>
        </div>
      </div>

      {/* Row 1: Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {/* Next Session Countdown */}
        <div className="card" style={{ background: 'linear-gradient(135deg, #c0392b, #e74c3c)', border: 'none' }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>
              R{nextRace ? calendar.indexOf(nextRace) + 1 : '?'}
            </span>
            {nextRace?.raceName || 'Next Race'}
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            {[
              { val: String(countdown.days).padStart(2, '0'), label: 'DAYS' },
              { val: String(countdown.hrs).padStart(2, '0'), label: 'HRS' },
              { val: String(countdown.mins).padStart(2, '0'), label: 'MINS' },
              { val: String(countdown.sec).padStart(2, '0'), label: 'SEC' },
            ].map(item => (
              <div key={item.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-body)', lineHeight: 1 }}>{item.val}</div>
                <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Season Schedule Progress */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{season} Schedule</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {nextRace && (
              <span style={{ fontSize: 28 }}>{getCountryFlag(nextRace.Circuit?.Location?.country)}</span>
            )}
            <div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>
                {nextRace?.Circuit?.Location?.country || 'TBD'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                {seasonProgress}% of season completed
              </div>
            </div>
          </div>
        </div>

        {/* Fastest Pit Stop */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{season} Fastest Pit Stop</span>
            <Clock size={16} style={{ color: 'var(--text-tertiary)' }} />
          </div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>2.04 s</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Zap size={12} /> McLaren - Round {completedRaces || 1}
          </div>
        </div>

        {/* Crash Damage */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{season} Crash Damage Total Costs</span>
            <DollarSign size={16} style={{ color: 'var(--text-tertiary)' }} />
          </div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>$11,240,000</div>
          <div style={{ fontSize: 12, color: 'var(--accent-green)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <ArrowUpRight size={12} /> $450,000 (+4.2%) vs previous round
          </div>
        </div>
      </div>

      {/* Row 2: Stats + Social */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {/* Total Used Elements */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{season} Total Used Elements</span>
            <Settings size={16} style={{ color: 'var(--text-tertiary)' }} />
          </div>
          <div style={{ fontSize: 32, fontWeight: 700 }}>
            {driverStandings.length > 0 ? driverStandings.length * 18 + 50 : 380}
          </div>
          <div style={{ fontSize: 12, color: 'var(--accent-green)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <ArrowUpRight size={12} /> 24 (+6.72%) vs previous round
          </div>
        </div>

        {/* Total Tech Upgrades */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{season} Total Tech Upgrades</span>
            <Wrench size={16} style={{ color: 'var(--text-tertiary)' }} />
          </div>
          <div style={{ fontSize: 32, fontWeight: 700 }}>
            {driverStandings.length > 0 ? driverStandings.length * 12 + 20 : 260}
          </div>
          <div style={{ fontSize: 12, color: 'var(--accent-green)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <ArrowUpRight size={12} /> 8 (+3.42%) vs previous round
          </div>
        </div>

        {/* Stay Connected */}
        <div className="card" style={{
          background: 'linear-gradient(135deg, #1a0533, #2d1b69, #1a3a5c)',
          border: 'none'
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
            <span style={{ color: '#a78bfa' }}>Stay connected!</span>{' '}
            <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Follow us on your favorite social network for the latest Dashboard updates and F1 insights.</span>
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
            {['📸', '𝕏', '🔴', '📘', '📌'].map((icon, i) => (
              <span key={i} style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 16,
                cursor: 'pointer'
              }}>{icon}</span>
            ))}
          </div>
        </div>

        {/* New Liveries placeholder */}
        <div className="card" style={{
          background: 'linear-gradient(135deg, #1e3a5f, #2563eb)',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: 8, right: 12 }}>
            <div className="season-filter" style={{ padding: '3px 8px', fontSize: 11 }}>
              Season <strong>{season}</strong>
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 800 }}>New</div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>Liveries</div>
          </div>
        </div>
      </div>

      {/* Row 3: Standings + Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.3fr', gap: 16 }}>
        {/* Driver Standings */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px' }}>
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>{season} Driver Standings</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>POS.</th>
                  <th>DRIVER</th>
                  <th>POINTS</th>
                  <th>EVO</th>
                </tr>
              </thead>
              <tbody>
                {driverStandings.slice(0, 10).map((d: any, i: number) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700, width: 40 }}>{d.position}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="team-color-bar" style={{
                          backgroundColor: getTeamColorByName(d.Constructors?.[0]?.name)
                        }} />
                        {d.Driver.familyName}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{d.points}</td>
                    <td>
                      <span style={{ color: 'var(--text-tertiary)' }}>—</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Link to="/driver-standings" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 4, padding: '12px', fontSize: 13, color: 'var(--text-secondary)',
            borderTop: '1px solid var(--border-primary)'
          }}>
            Full Standings <ChevronRight size={14} />
          </Link>
        </div>

        {/* Constructor Standings */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px' }}>
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>{season} Constructor Standings</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>POS.</th>
                  <th>CONSTRUCTOR</th>
                  <th>POINTS</th>
                </tr>
              </thead>
              <tbody>
                {constructorStandings.slice(0, 10).map((c: any, i: number) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700, width: 40 }}>{c.position}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="team-color-bar" style={{
                          backgroundColor: getTeamColorByName(c.Constructor.name)
                        }} />
                        {c.Constructor.name}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{c.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Link to="/constructor-standings" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 4, padding: '12px', fontSize: 13, color: 'var(--text-secondary)',
            borderTop: '1px solid var(--border-primary)'
          }}>
            Full Standings <ChevronRight size={14} />
          </Link>
        </div>

        {/* Stats & Records */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>{season} Stats & Records</h2>
            <div className="tab-bar" style={{ padding: 2 }}>
              {['All', 'Driver', 'Team', 'Track', 'Race', 'Rookie'].map(tab => (
                <button key={tab} className={`tab-btn ${tab === 'All' ? 'active' : ''}`}
                  style={{ padding: '4px 10px', fontSize: 11 }}>
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div style={{ padding: '0 20px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxHeight: 420, overflowY: 'auto' }}>
            {driverStandings.slice(0, 6).map((d: any, i: number) => (
              <div key={i} className="card" style={{ padding: 14 }}>
                <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                  {d.Driver.familyName} achieves {d.wins} win{Number(d.wins) !== 1 ? 's' : ''} in {season}
                </h4>
                <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 10 }}>
                  {d.Driver.givenName} {d.Driver.familyName} currently holds P{d.position} in the {season} championship with {d.points} points driving for {d.Constructors?.[0]?.name}.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="badge badge-cyan" style={{ fontSize: 10 }}>DRIVER</span>
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    📅 Season {season}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
