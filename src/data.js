// Inhalte der App als IDs. Die Texte dazu stehen in src/locales/, zum Beispiel exercise.<id>.name.
export const QUOTE_COUNT = 20;

export const HABITS = [
  { id: 'wasser', emoji: '💧' },
  { id: 'gemuese', emoji: '🥕' },
  { id: 'schlaf', emoji: '🌙' },
  { id: 'bildschirm', emoji: '📵' },
];

export const OUTDOOR = [
  { id: 'laufen', emoji: '🏃' },
  { id: 'rad', emoji: '🚴' },
  { id: 'spazieren', emoji: '🚶' },
  { id: 'spielen', emoji: '⚽' },
];

export const EXERCISES = [
  { id: 'hampelmann', emoji: '⭐', types: ['cardio', 'mix'] },
  { id: 'kniebeuge', emoji: '🦵', types: ['kraft', 'mix'], quiet: true },
  { id: 'liegestuetz', emoji: '💪', types: ['kraft', 'mix'], quiet: true },
  { id: 'kniehebelauf', emoji: '🏃', types: ['cardio', 'mix'] },
  { id: 'plank', emoji: '🧱', types: ['kraft', 'mix'], hold: true, quiet: true },
  { id: 'ausfallschritt', emoji: '🚶', types: ['kraft', 'cardio', 'mix'], quiet: true },
  { id: 'bergsteiger', emoji: '⛰️', types: ['cardio', 'mix'], quiet: true },
  { id: 'bruecke', emoji: '🌉', types: ['kraft', 'mix'], quiet: true },
  { id: 'seilspringen', emoji: '🪢', types: ['cardio'] },
  { id: 'anfersen', emoji: '👟', types: ['cardio'] },
  { id: 'schattenboxen', emoji: '🥊', types: ['cardio'], quiet: true },
  { id: 'steptouch', emoji: '💃', types: ['cardio'], quiet: true },
  { id: 'marschieren', emoji: '🥁', types: ['cardio'], quiet: true },
  { id: 'skater', emoji: '⛸️', types: ['cardio', 'mix'] },
  { id: 'hockstreck', emoji: '🚀', types: ['cardio', 'mix'] },
  { id: 'burpee', emoji: '🐻', types: ['mix'], quiet: true },
  { id: 'superman', emoji: '🦸', types: ['mix'], quiet: true },
  { id: 'seitstuetz', emoji: '📐', types: ['mix'], hold: true, quiet: true },
];

export const LEAGUES = [
  { id: 'bronze', emoji: '🥉' },
  { id: 'silber', emoji: '🥈' },
  { id: 'gold', emoji: '🥇' },
  { id: 'diamant', emoji: '💎' },
];

export const BOT_NAMES = [
  'Lina', 'Noah', 'Mia', 'Ben', 'Emma', 'Paul', 'Lea', 'Finn', 'Sofia', 'Jonas',
  'Mila', 'Elias', 'Hanna', 'Luca', 'Ida', 'Theo', 'Nora', 'Max', 'Ella', 'Tom',
];

// Pokale belohnen nur Aktivität – nie Körperdaten wie Gewicht.
export const TROPHIES = [
  { id: 'erster', emoji: '🐾', check: (s) => s.stats.activities >= 1 },
  { id: 'streak3', emoji: '🔥', check: (s) => s.streak.best >= 3 },
  { id: 'streak7', emoji: '🌟', check: (s) => s.streak.best >= 7 },
  { id: 'streak30', emoji: '🏔️', check: (s) => s.streak.best >= 30 },
  { id: 'streak100', emoji: '👑', check: (s) => s.streak.best >= 100 },
  { id: 'workout10', emoji: '💪', check: (s) => s.stats.workouts >= 10 },
  { id: 'workout50', emoji: '🏋️', check: (s) => s.stats.workouts >= 50 },
  { id: 'draussen', emoji: '🌳', check: (s) => s.stats.outdoorMinutes >= 300 },
  { id: 'sport', emoji: '⚽', check: (s) => s.stats.sports >= 1 },
  { id: 'gewohnheit', emoji: '🥕', check: (s) => s.stats.perfectDays >= 1 },
  { id: 'xp1000', emoji: '⚡', check: (s) => s.xp >= 1000 },
  { id: 'liga', emoji: '🏆', check: (s) => s.league.index >= 1 },
];
