import { useEffect, useState } from 'react';
import { standingsApi } from '../api/standings';
import { Flag, Timer, Zap } from 'lucide-react';
import styles from './LastRace.module.css';

export default function LastRace() {
  const [raceData, setRaceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    standingsApi.getLastRaceResults().then(data => {
      setRaceData(data);
      setLoading(false);
    }).catch(console.error);
  }, []);

  if (loading) return <div className="animate-pulse">Loading Race Data...</div>;
  if (!raceData) return <div>No recent race data found.</div>;

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <div className={styles.header}>
        <div className={styles.headerTag}><Flag size={16}/> LAST RACE RESULTS</div>
        <h1>{raceData.raceName}</h1>
        <p>{raceData.Circuit.circuitName}, Round {raceData.round} - {raceData.season}</p>
      </div>

      <div className={styles.podiumGrid}>
        {raceData.Results.slice(0, 3).map((res: any, idx: number) => (
          <div key={res.position} className={`glass-panel ${styles.podiumCard} ${styles['pos' + (idx + 1)]}`} style={{ animationDelay: `${idx * 0.1}s` }}>
            <div className={styles.posBadge}>P{res.position}</div>
            <h2>{res.Driver.givenName} {res.Driver.familyName}</h2>
            <div className={styles.team}>{res.Constructor.name}</div>
            <div className={styles.stats}>
              <span><Timer size={14}/> {res.Time?.time || res.status}</span>
              <span><Zap size={14}/> +{res.points} pts</span>
            </div>
          </div>
        ))}
      </div>

      <div className={`glass-panel ${styles.fullResults}`}>
        <h3>Full Classification</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Pos</th>
                <th>Driver</th>
                <th>Constructor</th>
                <th>Laps</th>
                <th>Time/Status</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {raceData.Results.map((res: any) => (
                <tr key={res.position}>
                  <td>{res.position}</td>
                  <td className={styles.driverName}>{res.Driver.givenName} {res.Driver.familyName}</td>
                  <td>{res.Constructor.name}</td>
                  <td>{res.laps}</td>
                  <td>{res.Time?.time || res.status}</td>
                  <td className={styles.points}>{res.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
