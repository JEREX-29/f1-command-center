import { useState, useEffect } from 'react';
import { Calendar, Trophy, Zap, Timer, Flag } from 'lucide-react';
import { standingsApi } from '../api/standings';
import { useTheme } from '../context/ThemeContext';
import { getTeamColorByName, getCountryFlag, AVAILABLE_SEASONS } from '../api/f1Data';

type SessionTab = 'race' | 'qualifying' | 'sprint' | 'grid';

export default function Results() {
  const { season } = useTheme();
  const [calendar, setCalendar] = useState<any[]>([]);
  const [selectedRound, setSelectedRound] = useState<number>(0);
  const [raceData, setRaceData] = useState<any>(null);
  const [qualifyingData, setQualifyingData] = useState<any>(null);
  const [sprintData, setSprintData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<SessionTab>('race');

  // Load calendar
  useEffect(() => {
    setLoading(true);
    standingsApi.getCalendar(season).then(cal => {
      setCalendar(cal);
      // Find latest completed race
      const now = new Date();
      const completed = cal.filter((r: any) => new Date(r.date) <= now);
      if (completed.length > 0) {
        setSelectedRound(parseInt(completed[completed.length - 1].round));
      } else if (cal.length > 0) {
        setSelectedRound(parseInt(cal[0].round));
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [season]);

  // Load results for selected round
  useEffect(() => {
    if (!selectedRound) return;
    setLoading(true);
    Promise.all([
      standingsApi.getRaceResults(season, selectedRound).catch(() => null),
      standingsApi.getQualifyingResults(season, selectedRound).catch(() => null),
      standingsApi.getSprintResults(season, selectedRound).catch(() => null),
    ]).then(([race, qual, sprint]) => {
      setRaceData(race);
      setQualifyingData(qual);
      setSprintData(sprint);
      setLoading(false);
    });
  }, [season, selectedRound]);

  const selectedRace = calendar.find((r: any) => parseInt(r.round) === selectedRound);
  const results = activeTab === 'race' ? raceData?.Results :
    activeTab === 'qualifying' ? qualifyingData?.QualifyingResults :
    activeTab === 'sprint' ? sprintData?.SprintResults : raceData?.Results;

  // Extract summary info
  const winner = raceData?.Results?.[0];
  const poleHolder = qualifyingData?.QualifyingResults?.[0];
  const fastestLapDriver = raceData?.Results?.find((r: any) => r.FastestLap?.rank === '1');

  if (loading && calendar.length === 0) {
    return <div className="loading-spinner"><div className="spinner" /></div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Controls */}
      <div className="page-controls">
        <div className="season-filter">
          <Calendar size={14} />
          <span>Season</span>
          <select value={season} onChange={() => {}} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontWeight: 600 }}>
            {AVAILABLE_SEASONS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="season-filter">
          <Flag size={14} />
          <span>Grand Prix</span>
          <select
            value={selectedRound}
            onChange={e => setSelectedRound(parseInt(e.target.value))}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontWeight: 600, maxWidth: 160 }}
          >
            {calendar.map((r: any) => (
              <option key={r.round} value={r.round}>
                {r.raceName?.replace(' Grand Prix', '')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {/* Race Winner */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Race Winner</span>
            <Trophy size={16} style={{ color: 'var(--text-tertiary)' }} />
          </div>
          {winner ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="team-color-bar" style={{ backgroundColor: getTeamColorByName(winner.Constructor?.name), height: 24 }} />
                <span style={{ fontSize: 20, fontWeight: 700 }}>{winner.Driver?.familyName}</span>
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>{winner.Time?.time || winner.status}</div>
            </>
          ) : (
            <div style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>No data</div>
          )}
        </div>

        {/* Pole Position */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Pole Position</span>
            <Zap size={16} style={{ color: 'var(--text-tertiary)' }} />
          </div>
          {poleHolder ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="team-color-bar" style={{ backgroundColor: getTeamColorByName(poleHolder.Constructor?.name), height: 24 }} />
                <span style={{ fontSize: 20, fontWeight: 700 }}>{poleHolder.Driver?.familyName}</span>
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
                {poleHolder.Q3 || poleHolder.Q2 || poleHolder.Q1 || '—'}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>No data</div>
          )}
        </div>

        {/* Fastest Lap */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Fastest Lap</span>
            <Timer size={16} style={{ color: 'var(--text-tertiary)' }} />
          </div>
          {fastestLapDriver ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="team-color-bar" style={{ backgroundColor: getTeamColorByName(fastestLapDriver.Constructor?.name), height: 24 }} />
                <span style={{ fontSize: 20, fontWeight: 700 }}>{fastestLapDriver.Driver?.familyName}</span>
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
                {fastestLapDriver.FastestLap?.Time?.time || '—'} – Lap {fastestLapDriver.FastestLap?.lap || '?'}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>No data</div>
          )}
        </div>
      </div>

      {/* Session Tabs */}
      <div className="tab-bar" style={{ alignSelf: 'flex-start' }}>
        {[
          { key: 'qualifying', label: 'Qualifying' },
          { key: 'grid', label: 'Starting Grid' },
          { key: 'sprint', label: 'Sprint' },
          { key: 'race', label: 'Race' },
        ].map(tab => (
          <button key={tab.key} className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key as SessionTab)}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Results Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : results && results.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 50 }}>POS.</th>
                  <th style={{ width: 50 }}>NO.</th>
                  <th>DRIVER</th>
                  <th>TEAM</th>
                  <th>TIME</th>
                  {activeTab === 'race' && <th>GAP TO LEADER</th>}
                  {activeTab === 'race' && <th>INTERVAL</th>}
                  {activeTab === 'race' && <th>POINTS</th>}
                  {activeTab === 'race' && <th>LAPS</th>}
                  {activeTab === 'qualifying' && <th>Q1</th>}
                  {activeTab === 'qualifying' && <th>Q2</th>}
                  {activeTab === 'qualifying' && <th>Q3</th>}
                </tr>
              </thead>
              <tbody>
                {results.map((r: any, i: number) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700 }}>{r.position}</td>
                    <td style={{ fontWeight: 700, color: getTeamColorByName(r.Constructor?.name) }}>
                      {r.number}
                    </td>
                    <td style={{ fontWeight: 500 }}>
                      {r.Driver?.familyName || r.Driver?.driverId}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="team-color-bar" style={{ backgroundColor: getTeamColorByName(r.Constructor?.name) }} />
                        {r.Constructor?.name}
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace' }}>
                      {activeTab === 'race' ? (r.Time?.time || r.status || '—') :
                       activeTab === 'qualifying' ? (r.Q3 || r.Q2 || r.Q1 || '—') : '—'}
                    </td>
                    {activeTab === 'race' && (
                      <>
                        <td style={{ fontFamily: 'monospace', color: i === 0 ? 'var(--text-primary)' : 'var(--accent-green)' }}>
                          {i === 0 ? '' : r.Time?.time ? `+${r.Time.time}` : r.status}
                        </td>
                        <td style={{ fontFamily: 'monospace' }}>
                          {i === 0 ? '' : r.Time?.time || r.status}
                        </td>
                        <td style={{ fontWeight: 600 }}>{r.points}</td>
                        <td>{r.laps}</td>
                      </>
                    )}
                    {activeTab === 'qualifying' && (
                      <>
                        <td style={{ fontFamily: 'monospace' }}>{r.Q1 || '—'}</td>
                        <td style={{ fontFamily: 'monospace' }}>{r.Q2 || '—'}</td>
                        <td style={{ fontFamily: 'monospace' }}>{r.Q3 || '—'}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <Flag size={48} />
            <h3>No Results Available</h3>
            <p>Results for this session are not available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
