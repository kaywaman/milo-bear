// Spiellogik ohne DOM: Streaks, XP, Liga, Pokale. Alle Funktionen ändern den übergebenen Zustand.
import { BOT_NAMES, HABITS, LEAGUES, TROPHIES } from './data.js';

export const DAILY_XP_CAP = 120; // Schützt vor Übertraining: Mehr Sport bringt ab hier keine Punkte.
export const MAX_FREEZES = 2;
const BOT_COUNT = 9;
const PROMOTE_RANK = 3;

export function dateKey(date = new Date()) {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

export function parseKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key, days) {
  const date = parseKey(key);
  date.setDate(date.getDate() + days);
  return dateKey(date);
}

export function weekKey(key) {
  const offset = (parseKey(key).getDay() + 6) % 7;
  return addDays(key, -offset);
}

export function newGameState(today) {
  return {
    xp: 0,
    streak: { count: 0, best: 0, lastDay: null, checkedThrough: today, freezes: 1 },
    stats: { activities: 0, workouts: 0, outdoorMinutes: 0, sports: 0, perfectDays: 0 },
    day: { key: today, xp: 0, habits: [] },
    league: { index: 0, week: weekKey(today), xp: 0, lastResult: null },
    trophies: {},
    log: [],
    activeDays: [],
  };
}

function hash(text) {
  let h = 2166136261;
  for (const ch of text) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  // Nachmischen, sonst unterscheiden sich ähnliche Eingaben nur in den unteren Bits.
  h = Math.imul(h ^ (h >>> 13), 1540483477);
  return (h ^ (h >>> 15)) >>> 0;
}

// Computergesteuerte Mitspieler: gleiche Woche + Liga ergibt immer dieselbe Liste.
export function leaderboard(state, today, { nickname = '', finished = false } = {}) {
  const { week, index, xp } = state.league;
  const elapsed = finished ? 7 : Math.min(7, Math.round((parseKey(today) - parseKey(week)) / 864e5) + 1);
  const names = [...BOT_NAMES].sort((a, b) => hash(`${week}:${index}:${a}`) - hash(`${week}:${index}:${b}`));
  const bots = names.slice(0, BOT_COUNT).map((name) => {
    const weekly = 90 + hash(`${week}:${index}:xp:${name}`) % 180 + index * 70;
    return {
      name,
      xp: Math.round((weekly * elapsed) / 7),
      bot: true,
    };
  });
  return [...bots, { name: nickname, xp, me: true }]
    .sort((a, b) => b.xp - a.xp || (a.me ? -1 : 1))
    .map((row, i) => ({ ...row, rank: i + 1 }));
}

function rollWeek(state, today, events) {
  const current = weekKey(today);
  if (state.league.week === current) return;
  const board = leaderboard(state, today, { finished: true });
  const rank = board.find((r) => r.me).rank;
  const promoted = state.league.xp > 0 && rank <= PROMOTE_RANK && state.league.index < LEAGUES.length - 1;
  if (promoted) state.league.index += 1;
  state.league.lastResult = { rank, promoted, league: state.league.index };
  state.league.week = current;
  state.league.xp = 0;
  if (promoted) events.push({ type: 'promoted', league: LEAGUES[state.league.index].id });
}

// Beim Öffnen aufrufen: prüft verpasste Tage, setzt Tageswerte zurück, schließt die Ligawoche ab.
export function reconcile(state, today, isRestDay, events = []) {
  const s = state.streak;
  if (state.day.key !== today) state.day = { key: today, xp: 0, habits: [] };

  const yesterday = addDays(today, -1);
  if (s.count > 0) {
    let start = addDays(s.checkedThrough > s.lastDay ? s.checkedThrough : s.lastDay, 1);
    while (start <= yesterday) {
      if (!isRestDay(parseKey(start))) {
        if (s.freezes > 0) {
          s.freezes -= 1;
          events.push({ type: 'freeze', day: start });
        } else {
          events.push({ type: 'streak_lost', count: s.count });
          s.count = 0;
          break;
        }
      }
      start = addDays(start, 1);
    }
  }
  if (yesterday > s.checkedThrough) s.checkedThrough = yesterday;

  rollWeek(state, today, events);
  collectTrophies(state, events);
  return events;
}

function collectTrophies(state, events) {
  for (const t of TROPHIES) {
    if (!state.trophies[t.id] && t.check(state)) {
      state.trophies[t.id] = state.day.key;
      events.push({ type: 'trophy', trophy: t });
    }
  }
}

function addXp(state, amount) {
  const granted = Math.max(0, Math.min(amount, DAILY_XP_CAP - state.day.xp));
  state.day.xp += granted;
  state.xp += granted;
  state.league.xp += granted;
  return granted;
}

function markActive(state, today, events) {
  const s = state.streak;
  if (s.lastDay === today) return;
  s.count += 1;
  s.lastDay = today;
  state.activeDays = [...(state.activeDays ?? []), today].slice(-14);
  s.best = Math.max(s.best, s.count);
  if (s.count % 7 === 0 && s.freezes < MAX_FREEZES) {
    s.freezes += 1;
    events.push({ type: 'freeze_earned' });
  }
  events.push({ type: 'streak', count: s.count });
}

// kind: 'workout' | 'outdoor' | 'sport'
export function logActivity(state, today, { kind, minutes = 0, name = '' }) {
  const events = [];
  const base = kind === 'workout' ? 30 : Math.min(30, 5 + Math.round(minutes / 2));
  const xp = addXp(state, base);
  state.stats.activities += 1;
  if (kind === 'workout') state.stats.workouts += 1;
  if (kind === 'outdoor') state.stats.outdoorMinutes += minutes;
  if (kind === 'sport') state.stats.sports += 1;
  state.log.unshift({ day: today, kind, minutes, name, xp });
  state.log.length = Math.min(state.log.length, 100);
  markActive(state, today, events);
  events.unshift({ type: 'activity', kind, xp });
  collectTrophies(state, events);
  return events;
}

export function completeHabit(state, today, id) {
  const events = [];
  if (state.day.habits.includes(id)) return events;
  state.day.habits.push(id);
  const xp = addXp(state, 5);
  events.push({ type: 'habit', xp });
  if (state.day.habits.length === HABITS.length) {
    state.stats.perfectDays += 1;
    state.stats.activities += 1;
    const bonus = addXp(state, 10);
    events.push({ type: 'perfect_day', xp: bonus });
    markActive(state, today, events);
  }
  collectTrophies(state, events);
  return events;
}
