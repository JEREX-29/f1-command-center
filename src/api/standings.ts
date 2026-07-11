const BASE_URL = 'https://api.jolpi.ca/ergast/f1';

async function fetchErgast(path: string) {
  const res = await fetch(`${BASE_URL}/${path}`);
  if (!res.ok) throw new Error(`Ergast API error: ${res.status}`);
  return res.json();
}

export const standingsApi = {
  async getDriverStandings(year: number = 2025) {
    const data = await fetchErgast(`${year}/driverStandings.json`);
    return data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings || [];
  },

  async getConstructorStandings(year: number = 2025) {
    const data = await fetchErgast(`${year}/constructorStandings.json`);
    return data.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings || [];
  },

  async getCalendar(year: number = 2025) {
    const data = await fetchErgast(`${year}.json`);
    return data.MRData.RaceTable.Races || [];
  },

  async getLastRaceResults() {
    const data = await fetchErgast('current/last/results.json');
    return data.MRData.RaceTable.Races[0] || null;
  },

  async getRaceResults(year: number, round: number) {
    const data = await fetchErgast(`${year}/${round}/results.json`);
    return data.MRData.RaceTable.Races[0] || null;
  },

  async getQualifyingResults(year: number, round: number) {
    const data = await fetchErgast(`${year}/${round}/qualifying.json`);
    return data.MRData.RaceTable.Races[0] || null;
  },

  async getSprintResults(year: number, round: number) {
    try {
      const data = await fetchErgast(`${year}/${round}/sprint.json`);
      return data.MRData.RaceTable.Races[0] || null;
    } catch { return null; }
  },

  async getDriverInfo(year: number = 2025) {
    const data = await fetchErgast(`${year}/drivers.json?limit=30`);
    return data.MRData.DriverTable.Drivers || [];
  },

  async getConstructorInfo(year: number = 2025) {
    const data = await fetchErgast(`${year}/constructors.json`);
    return data.MRData.ConstructorTable.Constructors || [];
  },

  async getDriverSeasonResults(year: number, driverId: string) {
    const data = await fetchErgast(`${year}/drivers/${driverId}/results.json?limit=50`);
    return data.MRData.RaceTable.Races || [];
  },

  async getAllRaceResults(year: number) {
    const data = await fetchErgast(`${year}/results.json?limit=500`);
    return data.MRData.RaceTable.Races || [];
  },

  async getPitStops(year: number, round: number) {
    try {
      const data = await fetchErgast(`${year}/${round}/pitstops.json?limit=100`);
      return data.MRData.RaceTable.Races[0]?.PitStops || [];
    } catch { return []; }
  },

  async getLapTimes(year: number, round: number, driverId: string) {
    try {
      const data = await fetchErgast(`${year}/${round}/drivers/${driverId}/laps.json?limit=100`);
      return data.MRData.RaceTable.Races[0]?.Laps || [];
    } catch { return []; }
  },

  async getSeasonList() {
    const data = await fetchErgast('seasons.json?limit=100');
    return data.MRData.SeasonTable.Seasons || [];
  },
};
