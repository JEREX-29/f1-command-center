// Static F1 Data - Team colors, driver info, circuit data

export const TEAM_COLORS: Record<string, string> = {
  'mercedes': '#27f4d2',
  'ferrari': '#e80020',
  'red_bull': '#3671c6',
  'mclaren': '#ff8000',
  'alpine': '#0093cc',
  'rb': '#6692ff',
  'alphatauri': '#6692ff',
  'aston_martin': '#229971',
  'williams': '#64c4ff',
  'haas': '#b6babd',
  'alfa': '#a6051a',
  'sauber': '#a6051a',
  'audi': '#ff0000',
  'kick_sauber': '#a6051a',
};

export const TEAM_NAMES_MAP: Record<string, string> = {
  'mercedes': 'Mercedes',
  'ferrari': 'Ferrari',
  'red_bull': 'Red Bull Racing',
  'mclaren': 'McLaren',
  'alpine': 'Alpine',
  'rb': 'RB',
  'alphatauri': 'RB',
  'aston_martin': 'Aston Martin',
  'williams': 'Williams',
  'haas': 'Haas',
  'sauber': 'Kick Sauber',
  'kick_sauber': 'Kick Sauber',
  'audi': 'Audi',
};

export function getTeamColor(teamId: string): string {
  if (!teamId) return '#888888';
  const key = teamId.toLowerCase().replace(/\s+/g, '_');
  // Try direct match
  if (TEAM_COLORS[key]) return TEAM_COLORS[key];
  // Try partial match
  for (const [k, v] of Object.entries(TEAM_COLORS)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return '#888888';
}

export function getTeamColorByName(teamName: string): string {
  if (!teamName) return '#888888';
  const name = teamName.toLowerCase();
  if (name.includes('mercedes')) return TEAM_COLORS.mercedes;
  if (name.includes('ferrari')) return TEAM_COLORS.ferrari;
  if (name.includes('red bull') && !name.includes('rb')) return TEAM_COLORS.red_bull;
  if (name.includes('mclaren')) return TEAM_COLORS.mclaren;
  if (name.includes('alpine')) return TEAM_COLORS.alpine;
  if (name === 'rb' || name.includes('alphatauri') || name.includes('visa cash app')) return TEAM_COLORS.rb;
  if (name.includes('aston')) return TEAM_COLORS.aston_martin;
  if (name.includes('williams')) return TEAM_COLORS.williams;
  if (name.includes('haas')) return TEAM_COLORS.haas;
  if (name.includes('audi')) return TEAM_COLORS.audi;
  if (name.includes('sauber') || name.includes('kick')) return TEAM_COLORS.kick_sauber;
  return '#888888';
}

export const COUNTRY_FLAGS: Record<string, string> = {
  'Australian': '🇦🇺', 'Chinese': '🇨🇳', 'Japanese': '🇯🇵',
  'Bahrain': '🇧🇭', 'Saudi Arabian': '🇸🇦', 'Miami': '🇺🇸',
  'Emilia Romagna': '🇮🇹', 'Monaco': '🇲🇨', 'Spanish': '🇪🇸',
  'Canadian': '🇨🇦', 'Austrian': '🇦🇹', 'British': '🇬🇧',
  'Hungarian': '🇭🇺', 'Belgian': '🇧🇪', 'Dutch': '🇳🇱',
  'Italian': '🇮🇹', 'Azerbaijan': '🇦🇿', 'Singapore': '🇸🇬',
  'United States': '🇺🇸', 'Mexico City': '🇲🇽', 'São Paulo': '🇧🇷',
  'Las Vegas': '🇺🇸', 'Qatar': '🇶🇦', 'Abu Dhabi': '🇦🇪',
  'Portugal': '🇵🇹', 'Turkish': '🇹🇷', 'French': '🇫🇷',
  'Styrian': '🇦🇹', 'Tuscan': '🇮🇹', 'Russian': '🇷🇺',
  'Eifel': '🇩🇪', 'Sakhir': '🇧🇭', 'Belgium': '🇧🇪',
  'Great Britain': '🇬🇧', 'Netherlands': '🇳🇱',
  'USA': '🇺🇸', 'Mexico': '🇲🇽', 'Brazil': '🇧🇷',
  'Japan': '🇯🇵', 'China': '🇨🇳', 'Australia': '🇦🇺',
  'Spain': '🇪🇸', 'Canada': '🇨🇦', 'Austria': '🇦🇹',
  'Hungary': '🇭🇺', 'Italy': '🇮🇹', 'Germany': '🇩🇪',
  'France': '🇫🇷', 'Monaco GP': '🇲🇨', 'Saudi Arabia': '🇸🇦',
};

export const DRIVER_NATIONALITY_FLAGS: Record<string, string> = {
  'British': '🇬🇧', 'Dutch': '🇳🇱', 'Monegasque': '🇲🇨',
  'Spanish': '🇪🇸', 'Mexican': '🇲🇽', 'Australian': '🇦🇺',
  'Finnish': '🇫🇮', 'French': '🇫🇷', 'Canadian': '🇨🇦',
  'German': '🇩🇪', 'Japanese': '🇯🇵', 'Thai': '🇹🇭',
  'Chinese': '🇨🇳', 'Danish': '🇩🇰', 'American': '🇺🇸',
  'Italian': '🇮🇹', 'New Zealander': '🇳🇿',
  'Argentine': '🇦🇷', 'Argentinian': '🇦🇷',
  'Brazilian': '🇧🇷', 'Swiss': '🇨🇭',
};

export const TYRE_COMPOUNDS: Record<string, { color: string; label: string }> = {
  'SOFT': { color: '#ff3333', label: 'S' },
  'MEDIUM': { color: '#ffd700', label: 'M' },
  'HARD': { color: '#f0f0f0', label: 'H' },
  'INTERMEDIATE': { color: '#43b02a', label: 'I' },
  'WET': { color: '#0067e6', label: 'W' },
};

export function getTyreColor(compound: string): string {
  const upper = (compound || '').toUpperCase();
  return TYRE_COMPOUNDS[upper]?.color || '#888';
}

export function getTyreLabel(compound: string): string {
  const upper = (compound || '').toUpperCase();
  return TYRE_COMPOUNDS[upper]?.label || '?';
}

export function getCountryFlag(name: string): string {
  if (!name) return '🏁';
  // Try direct match
  if (COUNTRY_FLAGS[name]) return COUNTRY_FLAGS[name];
  // Try partial match
  for (const [k, v] of Object.entries(COUNTRY_FLAGS)) {
    if (name.includes(k) || k.includes(name)) return v;
  }
  return '🏁';
}

export function getDriverFlag(nationality: string): string {
  return DRIVER_NATIONALITY_FLAGS[nationality] || '🏁';
}

// Power Unit Elements
export const PU_ELEMENTS = [
  { key: 'ICE', label: 'Internal Combustion Engine', limit: 3 },
  { key: 'TC', label: 'Turbocharger', limit: 3 },
  { key: 'MGU-H', label: 'MGU-H', limit: 3 },
  { key: 'MGU-K', label: 'MGU-K', limit: 3 },
  { key: 'ES', label: 'Energy Store', limit: 2 },
  { key: 'CE', label: 'Control Electronics', limit: 2 },
  { key: 'GB', label: 'Gearbox', limit: 4 },
];

// Available seasons
export const AVAILABLE_SEASONS = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018];
