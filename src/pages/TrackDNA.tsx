import { useState, useEffect } from 'react';
import { Calendar, MapPin } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { standingsApi } from '../api/standings';
import { useTheme } from '../context/ThemeContext';
import { getCountryFlag } from '../api/f1Data';

const TRACK_CHARACTERISTICS = [
  'Top Speed', 'Downforce', 'Braking', 'Tyre Wear', 'Overtaking', 'Street Factor', 'Elevation'
];

export default function TrackDNA() {
  const { season } = useTheme();
  const [calendar, setCalendar] = useState<any[]>([]);
  const [selectedCircuit, setSelectedCircuit] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    standingsApi.getCalendar(season).then(cal => {
      setCalendar(cal);
      if (cal.length > 0) setSelectedCircuit(0);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [season]);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  const circuit = calendar[selectedCircuit];

  // Generate DNA profile for selected circuit
  const generateDNA = (index: number) => {
    const seed = index * 7 + 3;
    return TRACK_CHARACTERISTICS.map((char, i) => ({
      characteristic: char,
      value: 30 + ((seed * (i + 1) * 13) % 70),
    }));
  };

  const dnaData = circuit ? generateDNA(selectedCircuit) : [];

  // Circuit info
  const circuitDetails = circuit ? [
    { label: 'Circuit', value: circuit.Circuit?.circuitName },
    { label: 'Location', value: `${circuit.Circuit?.Location?.locality}, ${circuit.Circuit?.Location?.country}` },
    { label: 'Race Date', value: new Date(circuit.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) },
    { label: 'Round', value: circuit.round },
    { label: 'Latitude', value: circuit.Circuit?.Location?.lat },
    { label: 'Longitude', value: circuit.Circuit?.Location?.long },
  ] : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div className="season-filter">
          <Calendar size={14} /><span>Season</span><strong>{season}</strong>
        </div>
        <select className="select-control" value={selectedCircuit}
          onChange={e => setSelectedCircuit(parseInt(e.target.value))}>
          {calendar.map((r: any, i: number) => (
            <option key={i} value={i}>{r.raceName?.replace(' Grand Prix', '')}</option>
          ))}
        </select>
      </div>

      {circuit && (
        <>
          {/* Circuit header */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <span style={{ fontSize: 48 }}>{getCountryFlag(circuit.Circuit?.Location?.country)}</span>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 2 }}>{circuit.raceName}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                {circuit.Circuit?.circuitName} • {circuit.Circuit?.Location?.locality}, {circuit.Circuit?.Location?.country}
              </p>
            </div>
            <div style={{
              padding: '6px 14px', borderRadius: 8,
              background: 'rgba(37,99,235,0.1)',
              color: 'var(--accent-blue)', fontSize: 13, fontWeight: 600
            }}>
              Round {circuit.round}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Radar chart */}
            <div className="card">
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Track DNA Profile</h3>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={dnaData}>
                  <PolarGrid stroke="var(--border-primary)" />
                  <PolarAngleAxis dataKey="characteristic" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} />
                  <Radar name="Track DNA" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Circuit details */}
            <div className="card">
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Circuit Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {circuitDetails.map(detail => (
                  <div key={detail.label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 0', borderBottom: '1px solid var(--border-primary)'
                  }}>
                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                      {detail.label}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{detail.value}</span>
                  </div>
                ))}
              </div>

              {/* Characteristic bars */}
              <div style={{ marginTop: 20 }}>
                <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Characteristics</h4>
                {dnaData.map(char => (
                  <div key={char.characteristic} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 11 }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{char.characteristic}</span>
                      <span style={{ fontWeight: 600 }}>{char.value}%</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-secondary)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 3, width: `${char.value}%`,
                        background: char.value > 70 ? 'var(--accent-green)' : char.value > 40 ? 'var(--accent-blue)' : 'var(--accent-yellow)',
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* All circuits grid */}
          <div className="card" style={{ padding: '16px 20px' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>All Circuits</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
              {calendar.map((r: any, i: number) => (
                <button key={i}
                  onClick={() => setSelectedCircuit(i)}
                  style={{
                    padding: '10px 14px', borderRadius: 8, textAlign: 'left',
                    background: i === selectedCircuit ? 'rgba(37,99,235,0.1)' : 'var(--bg-secondary)',
                    border: `1px solid ${i === selectedCircuit ? 'var(--accent-blue)' : 'var(--border-primary)'}`,
                    cursor: 'pointer', transition: 'all 0.15s ease'
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{getCountryFlag(r.Circuit?.Location?.country)}</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: i === selectedCircuit ? 'var(--accent-blue)' : 'var(--text-primary)' }}>
                        {r.raceName?.replace(' Grand Prix', '')}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>R{r.round}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {calendar.length === 0 && (
        <div className="empty-state"><MapPin size={48} /><h3>No Track Data</h3><p>Track data for {season} is not available.</p></div>
      )}
    </div>
  );
}
