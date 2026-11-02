// Erstellt aus den Nutzerdaten Wochenplan, Trainingseinheiten und Prognose.
import { assess, weightPrognosis } from './health.js';
import { EXERCISES } from './data.js';

export const GOALS = {
  abnehmen: { emoji: '🎯', weight: true },
  zunehmen: { emoji: '🍽️', weight: true },
  kraft: { emoji: '💪' },
  ausdauer: { emoji: '🏃' },
  gesund: { emoji: '🌱' },
};

export const LEVELS = {
  1: { minutes: 15, workSec: 30 },
  2: { minutes: 20, workSec: 35 },
  3: { minutes: 30, workSec: 45 },
};

const REST_SEC = 15;

export const SESSION_TYPES = {
  kraft: { emoji: '💪' },
  cardio: { emoji: '⚡' },
  mix: { emoji: '🔥' },
  draussen: { emoji: '🌳' },
  rest: { emoji: '😴' },
};

// Welche Wochentage (0 = Montag) trainiert wird – Pausen möglichst gleichmäßig verteilt.
const DAY_SLOTS = {
  2: [1, 4], 3: [0, 2, 4], 4: [0, 1, 3, 5], 5: [0, 1, 3, 4, 5], 6: [0, 1, 2, 3, 4, 5],
};

const ROTATION = {
  abnehmen: ['cardio', 'mix', 'draussen', 'cardio', 'mix', 'draussen'],
  zunehmen: ['kraft', 'mix', 'kraft', 'draussen', 'kraft', 'mix'],
  kraft: ['kraft', 'mix', 'kraft', 'draussen', 'kraft', 'mix'],
  ausdauer: ['cardio', 'draussen', 'mix', 'cardio', 'draussen', 'mix'],
  gesund: ['mix', 'draussen', 'kraft', 'cardio', 'draussen', 'mix'],
};

// Wochen bis zum Fitnessziel je Level. Das Ziel selbst steht als target.<Ziel>.<Level> in den Übersetzungen.
const FITNESS_WEEKS = {
  kraft: { 1: 10, 2: 8, 3: 6 },
  ausdauer: { 1: 10, 2: 8, 3: 8 },
  gesund: { 1: 6, 2: 6, 3: 6 },
};

function fitnessPrognosis(goal, level, daysPerWeek) {
  // Referenz sind 4 Einheiten pro Woche; seltener trainieren dauert entsprechend länger.
  const weeksMin = Math.ceil(FITNESS_WEEKS[goal][level] * (4 / Math.min(daysPerWeek, 5)));
  return { weeksMin, weeksMax: Math.ceil(weeksMin * 1.4) };
}

export function targetDate(startKey, weeks) {
  const [y, m, d] = startKey.split('-').map(Number);
  return new Date(y, m - 1, d + weeks * 7);
}

export function buildPlan(profile, startKey) {
  const { goal, level, daysPerWeek, age } = profile;
  const slots = DAY_SLOTS[daysPerWeek];
  const rotation = ROTATION[goal];
  const week = Array.from({ length: 7 }, () => 'rest');
  slots.forEach((day, i) => { week[day] = rotation[i]; });

  const prognosis = GOALS[goal].weight
    ? weightPrognosis(profile, goal, profile.targetKg)
    : fitnessPrognosis(goal, level, daysPerWeek);

  return {
    week,
    sessionMinutes: LEVELS[level].minutes,
    // WHO: Kinder und Jugendliche 60 Minuten Bewegung täglich, Erwachsene umgerechnet gut 20–40.
    dailyMoveMinutes: age < 18 ? 60 : 30,
    prognosis,
    assessment: assess(profile),
    startKey,
  };
}

export const dayIndex = (date) => (date.getDay() + 6) % 7;

export const PICKER_TYPES = ['cardio', 'mix'];
export const MIN_PICKS = 3;
export const MAX_PICKS = 6;
const DEFAULT_PICKS = 5;

export const exercisePool = (type) => EXERCISES.filter((e) => e.types.includes(type));
export const defaultPicks = (type) => exercisePool(type).slice(0, DEFAULT_PICKS).map((e) => e.id);
export const quietPicks = (type) => exercisePool(type).filter((e) => e.quiet).slice(0, DEFAULT_PICKS).map((e) => e.id);
export function randomPicks(type, random = Math.random) {
  return exercisePool(type)
    .map((e) => ({ id: e.id, order: random() }))
    .sort((a, b) => a.order - b.order)
    .slice(0, DEFAULT_PICKS)
    .map((e) => e.id);
}

export function buildWorkout(type, level, ids) {
  const pool = exercisePool(type);
  const chosen = ids?.map((id) => pool.find((e) => e.id === id)).filter(Boolean) ?? [];
  const picks = chosen.length >= MIN_PICKS ? chosen.slice(0, MAX_PICKS) : pool.slice(0, DEFAULT_PICKS);
  const { minutes, workSec } = LEVELS[level];
  const workSeconds = (e) => (e.hold ? Math.round(workSec * 0.75) : workSec);
  // Die Rundenzahl gleicht aus, wie viele Übungen gewählt wurden – die Dauer bleibt gleich.
  const roundSeconds = picks.reduce((sum, e) => sum + workSeconds(e) + REST_SEC, 0);
  const rounds = Math.max(1, Math.round((minutes * 60) / roundSeconds));
  const steps = [];
  for (let r = 0; r < rounds; r++) {
    picks.forEach((e) => {
      steps.push({ ...e, seconds: workSeconds(e), round: r + 1 });
      steps.push({ pause: true, emoji: '💧', seconds: REST_SEC, round: r + 1 });
    });
  }
  steps.pop(); // Nach der letzten Übung ist das Training vorbei.
  return {
    type, rounds, steps, minutes: Math.round(steps.reduce((sum, s) => sum + s.seconds, 0) / 60),
  };
}
