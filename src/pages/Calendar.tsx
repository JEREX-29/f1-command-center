import { useEffect, useState, useMemo } from 'react';
import { standingsApi } from '../api/standings';
import { MapPin, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import styles from './Calendar.module.css';
import { format } from 'date-fns';

export default function Calendar() {
  const [races, setRaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRace, setExpandedRace] = useState<string | null>(null);
  
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const years = useMemo(() => {
    const y = [];
    for (let i = currentYear; i >= 1950; i--) {
      y.push(i);
    }
    return y;
  }, [currentYear]);

  useEffect(() => {
    setLoading(true);
    standingsApi.getCalendar(selectedYear).then(data => {
      setRaces(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [selectedYear]);

  const toggleRace = (round: string) => {
    setExpandedRace(expandedRace === round ? null : round);
  };

  const formatSessionTime = (dateStr: string, timeStr: string) => {
    if (!dateStr || !timeStr) return 'TBC';
    const d = new Date(`${dateStr}T${timeStr}`);
    return format(d, 'MMM d, HH:mm');
  };

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h1>Season Calendar</h1>
          <div className={styles.yearSelector}>
            <label htmlFor="year-select">Season:</label>
            <select 
              id="year-select"
              value={selectedYear} 
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
        <p>Explore the full {selectedYear} schedule, past and present.</p>
      </div>

      {loading ? (
        <div className="animate-pulse">Loading Season Data...</div>
      ) : (
        <div className={styles.list}>
          {races.map((race, index) => {
            const raceDate = new Date(`${race.date}T${race.time || '15:00:00Z'}`);
            const isPast = raceDate < new Date();
            const isExpanded = expandedRace === race.round;
            const hasExtraSessions = race.FirstPractice || race.Qualifying;
            
            return (
              <div key={race.round} className={`glass-panel ${styles.listItem} ${isPast ? styles.past : ''}`} style={{ animationDelay: `${index * 0.02}s` }}>
                
                <div className={styles.itemMain} onClick={() => hasExtraSessions && toggleRace(race.round)}>
                  <div className={styles.dateCol}>
                    <span className={styles.month}>{format(raceDate, 'MMM')}</span>
                    <span className={styles.day}>{format(raceDate, 'dd')}</span>
                  </div>

                  <div className={styles.infoCol}>
                    <div className={styles.roundBadge}>Round {race.round}</div>
                    <h2>{race.raceName}</h2>
                    <div className={styles.details}>
                      <span className={styles.detailItem}><MapPin size={14} /> {race.Circuit.circuitName}, {race.Circuit.Location.country}</span>
                      {race.time && <span className={styles.detailItem}><Clock size={14} /> {format(raceDate, 'HH:mm')} Local</span>}
                    </div>
                  </div>

                  {hasExtraSessions && (
                    <div className={styles.expandIcon}>
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  )}
                </div>

                {isExpanded && hasExtraSessions && (
                  <div className={styles.schedule}>
                    {race.FirstPractice && (
                      <div className={styles.scheduleItem}>
                        <span>Practice 1</span>
                        <span className={styles.scheduleTime}>{formatSessionTime(race.FirstPractice.date, race.FirstPractice.time)}</span>
                      </div>
                    )}
                    
                    {race.SprintQualifying ? (
                      <>
                        <div className={styles.scheduleItem}>
                          <span>Sprint Quali</span>
                          <span className={styles.scheduleTime}>{formatSessionTime(race.SprintQualifying.date, race.SprintQualifying.time)}</span>
                        </div>
                        <div className={styles.scheduleItem}>
                          <span className={styles.sprintHighlight}>Sprint Race</span>
                          <span className={styles.scheduleTime}>{formatSessionTime(race.Sprint.date, race.Sprint.time)}</span>
                        </div>
                        <div className={styles.scheduleItem}>
                          <span className={styles.qualiHighlight}>Qualifying</span>
                          <span className={styles.scheduleTime}>{formatSessionTime(race.Qualifying.date, race.Qualifying.time)}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        {race.SecondPractice && (
                          <div className={styles.scheduleItem}>
                            <span>Practice 2</span>
                            <span className={styles.scheduleTime}>{formatSessionTime(race.SecondPractice.date, race.SecondPractice.time)}</span>
                          </div>
                        )}
                        {race.ThirdPractice && (
                          <div className={styles.scheduleItem}>
                            <span>Practice 3</span>
                            <span className={styles.scheduleTime}>{formatSessionTime(race.ThirdPractice.date, race.ThirdPractice.time)}</span>
                          </div>
                        )}
                        {race.Qualifying && (
                          <div className={styles.scheduleItem}>
                            <span className={styles.qualiHighlight}>Qualifying</span>
                            <span className={styles.scheduleTime}>{formatSessionTime(race.Qualifying.date, race.Qualifying.time)}</span>
                          </div>
                        )}
                      </>
                    )}
                    <div className={styles.scheduleItem}>
                      <span className={styles.raceHighlight}>Grand Prix</span>
                      <span className={styles.scheduleTime}>{formatSessionTime(race.date, race.time)}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
