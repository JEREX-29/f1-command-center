import { useEffect, useState } from 'react';
import { openf1 } from '../api/openf1';
import { Activity, Timer } from 'lucide-react';
import styles from './LiveRace.module.css';

export default function LiveRace() {
  const [session, setSession] = useState<any>(null);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLive = async () => {
      try {
        const latestSession = await openf1.getLatestSession();
        setSession(latestSession);
        
        if (latestSession) {
          const sessionDrivers = await openf1.getDrivers(latestSession.session_key);
          setDrivers(sessionDrivers);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLive();
  }, []);

  if (loading) return <div className="animate-pulse">Connecting to telemetry...</div>;

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <div className={styles.header}>
        <div className={styles.liveIndicator}>
          <div className={styles.dot}></div>
          LIVE TIMING
        </div>
        <h1>{session ? session.session_name : 'No Active Session'}</h1>
        {session && <p className={styles.sessionDetails}>{session.circuit_short_name}</p>}
      </div>

      <div className={styles.grid}>
        <div className={`glass-panel ${styles.panel}`}>
          <h2><Activity size={20} /> Track Status</h2>
          <div className={styles.statusBox}>
            <div className={styles.statusValue}>GREEN</div>
            <div className={styles.statusLabel}>Track Clear</div>
          </div>
        </div>
        
        <div className={`glass-panel ${styles.panel} ${styles.driversPanel}`}>
          <h2><Timer size={20} /> Driver Telemetry (Latest Session)</h2>
          <div className={styles.driverList}>
            {drivers.slice(0, 10).map((d, i) => (
              <div key={d.driver_number} className={styles.driverCard} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className={styles.driverHeader}>
                  <span className={styles.position}>P{i + 1}</span>
                  <span className={styles.name}>{d.full_name}</span>
                </div>
                <div className={styles.teamLine} style={{ backgroundColor: `#${d.team_colour}` }}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
