import { useEffect, useState } from 'react';
import { standingsApi } from '../api/standings';
import styles from './Standings.module.css';

export default function Standings() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [constructors, setConstructors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'drivers' | 'constructors'>('drivers');

  useEffect(() => {
    Promise.all([
      standingsApi.getDriverStandings(2026),
      standingsApi.getConstructorStandings(2026)
    ]).then(([d, c]) => {
      setDrivers(d);
      setConstructors(c);
      setLoading(false);
    }).catch(console.error);
  }, []);

  if (loading) return <div className="animate-pulse">Loading Standings...</div>;

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <div className={styles.header}>
        <h1>2026 Championship</h1>
        <div className={styles.toggle}>
          <button 
            className={view === 'drivers' ? styles.activeBtn : ''} 
            onClick={() => setView('drivers')}
          >
            Drivers
          </button>
          <button 
            className={view === 'constructors' ? styles.activeBtn : ''} 
            onClick={() => setView('constructors')}
          >
            Constructors
          </button>
        </div>
      </div>

      <div className={`glass-panel ${styles.tableContainer}`}>
        {view === 'drivers' ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Pos</th>
                <th>Driver</th>
                <th>Constructor</th>
                <th>Points</th>
                <th>Wins</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((d: any, i) => (
                <tr key={d.Driver.driverId} style={{ animationDelay: `${i * 0.05}s` }} className="animate-slide-up">
                  <td>{d.position}</td>
                  <td className={styles.highlight}>{d.Driver.givenName} {d.Driver.familyName}</td>
                  <td>{d.Constructors[0]?.name}</td>
                  <td className={styles.points}>{d.points}</td>
                  <td>{d.wins}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Pos</th>
                <th>Constructor</th>
                <th>Nationality</th>
                <th>Points</th>
                <th>Wins</th>
              </tr>
            </thead>
            <tbody>
              {constructors.map((c: any, i) => (
                <tr key={c.Constructor.constructorId} style={{ animationDelay: `${i * 0.05}s` }} className="animate-slide-up">
                  <td>{c.position}</td>
                  <td className={styles.highlight}>{c.Constructor.name}</td>
                  <td>{c.Constructor.nationality}</td>
                  <td className={styles.points}>{c.points}</td>
                  <td>{c.wins}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
