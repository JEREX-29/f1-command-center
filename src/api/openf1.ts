const BASE_URL = 'https://api.openf1.org/v1';

async function fetchJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`OpenF1 API error: ${res.status}`);
  return res.json();
}

export const openf1 = {
  async getSessions(year: number = 2025) {
    return fetchJson(`${BASE_URL}/sessions?year=${year}`);
  },

  async getLatestSession() {
    try {
      const sessions = await this.getSessions();
      if (sessions?.length > 0) {
        return sessions.sort((a: any, b: any) =>
          new Date(b.date_start).getTime() - new Date(a.date_start).getTime()
        )[0];
      }
    } catch { /* ignore */ }
    return null;
  },

  async getSessionByKey(sessionKey: number) {
    const data = await fetchJson(`${BASE_URL}/sessions?session_key=${sessionKey}`);
    return data?.[0] || null;
  },

  async getDrivers(sessionKey: number) {
    return fetchJson(`${BASE_URL}/drivers?session_key=${sessionKey}`);
  },

  async getLaps(sessionKey: number, driverNumber?: number) {
    let url = `${BASE_URL}/laps?session_key=${sessionKey}`;
    if (driverNumber) url += `&driver_number=${driverNumber}`;
    return fetchJson(url);
  },

  async getPositions(sessionKey: number) {
    return fetchJson(`${BASE_URL}/position?session_key=${sessionKey}`);
  },

  async getIntervals(sessionKey: number) {
    return fetchJson(`${BASE_URL}/intervals?session_key=${sessionKey}`);
  },

  async getPitStops(sessionKey: number) {
    return fetchJson(`${BASE_URL}/pit?session_key=${sessionKey}`);
  },

  async getStints(sessionKey: number) {
    return fetchJson(`${BASE_URL}/stints?session_key=${sessionKey}`);
  },

  async getWeather(sessionKey: number) {
    return fetchJson(`${BASE_URL}/weather?session_key=${sessionKey}`);
  },

  async getRaceControl(sessionKey: number) {
    return fetchJson(`${BASE_URL}/race_control?session_key=${sessionKey}`);
  },

  async getTeamRadio(sessionKey: number) {
    return fetchJson(`${BASE_URL}/team_radio?session_key=${sessionKey}`);
  },

  async getCarData(sessionKey: number, driverNumber: number) {
    return fetchJson(`${BASE_URL}/car_data?session_key=${sessionKey}&driver_number=${driverNumber}&speed>=0`);
  },

  async getMeetings(year: number = 2025) {
    return fetchJson(`${BASE_URL}/meetings?year=${year}`);
  },
};
