import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, ExternalLink } from 'lucide-react';
import { standingsApi } from '../api/standings';
import { useTheme } from '../context/ThemeContext';
import { getCountryFlag } from '../api/f1Data';

export default function Schedule() {
  const { season } = useTheme();
  const [calendar, setCalendar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    standingsApi.getCalendar(season)
      .then(setCalendar)
      .catch(() => setCalendar([]))
      .finally(() => setLoading(false));
  }, [season]);

  if (loading) {
    return <div className="loading-spinner"><div className="spinner" /></div>;
  }

  const now = new Date();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="page-controls">
        <div className="season-filter">
          <Calendar size={14} />
          <span>Season</span>
          <strong>{season}</strong>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340, 1fr))', gap: 16 }}>
        {calendar.map((race: any) => {
          const raceDate = new Date(race.date + 'T' + (race.time || '14:00:00Z'));
          const isPast = raceDate < now;
          const isNext = !isPast && calendar.indexOf(race) > 0 &&
            new Date(calendar[calendar.indexOf(race) - 1].date) < now;

          return (
            <div key={race.round} className="card card-hover" style={{
              position: 'relative',
              borderLeft: `3px solid ${isNext ? 'var(--accent-blue)' : isPast ? 'var(--accent-green)' : 'var(--border-primary)'}`,
            }}>
              {/* Round badge */}
              <div style={{
                position: 'absolute', top: 12, right: 12,
                background: isNext ? 'var(--accent-blue)' : isPast ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)',
                color: isNext ? '#fff' : isPast ? 'var(--accent-green)' : 'var(--text-secondary)',
                padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600
              }}>
                {isNext ? 'NEXT' : isPast ? 'COMPLETED' : `R${race.round}`}
              </div>

              {/* Flag + Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 28 }}>
                  {getCountryFlag(race.Circuit?.Location?.country)}
                </span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{race.raceName}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    Round {race.round}
                  </div>
                </div>
              </div>

              {/* Circuit Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                <MapPin size={12} />
                {race.Circuit?.circuitName}, {race.Circuit?.Location?.locality}
              </div>

              {/* Date */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
                <Clock size={12} />
                {new Date(race.date).toLocaleDateString('en-US', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                })}
                {race.time && ` • ${race.time.replace(':00Z', ' UTC')}`}
              </div>

              {/* Session times */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6,
                padding: '10px 0', borderTop: '1px solid var(--border-primary)'
              }}>
                {race.FirstPractice && (
                  <SessionTime label="Practice 1" date={race.FirstPractice.date} time={race.FirstPractice.time} />
                )}
                {race.SecondPractice && (
                  <SessionTime label="Practice 2" date={race.SecondPractice.date} time={race.SecondPractice.time} />
                )}
                {race.ThirdPractice && (
                  <SessionTime label="Practice 3" date={race.ThirdPractice.date} time={race.ThirdPractice.time} />
                )}
                {race.Sprint && (
                  <SessionTime label="Sprint" date={race.Sprint.date} time={race.Sprint.time} />
                )}
                {race.Qualifying && (
                  <SessionTime label="Qualifying" date={race.Qualifying.date} time={race.Qualifying.time} />
                )}
                <SessionTime label="Race" date={race.date} time={race.time} highlight />
              </div>

              {race.url && (
                <a href={race.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--accent-blue)', marginTop: 8 }}>
                  More info <ExternalLink size={10} />
                </a>
              )}
            </div>
          );
        })}
      </div>

      {calendar.length === 0 && (
        <div className="empty-state">
          <Calendar size={48} />
          <h3>No Schedule Available</h3>
          <p>The {season} race calendar is not available yet.</p>
        </div>
      )}
    </div>
  );
}

function SessionTime({ label, date, time, highlight }: {
  label: string; date?: string; time?: string; highlight?: boolean;
}) {
  if (!date) return null;
  const d = new Date(date + 'T' + (time || '00:00:00Z'));
  return (
    <div style={{
      fontSize: 11, padding: '4px 8px', borderRadius: 4,
      background: highlight ? 'rgba(37,99,235,0.1)' : 'rgba(255,255,255,0.03)',
      color: highlight ? 'var(--accent-blue)' : 'var(--text-secondary)'
    }}>
      <div style={{ fontWeight: 600, marginBottom: 1 }}>{label}</div>
      <div>{d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {time ? time.replace(':00Z', '') : '—'}</div>
    </div>
  );
}
