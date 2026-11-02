// Gesundheits-Leitplanken für Gewichtsziele.
// Quelle: WHO Growth Reference 2007, BMI-for-age (5–19 Jahre), z-Score-Tabellen.
// Spalten: [-2 SD, -1 SD, Median, +1 SD]. Laut WHO gilt > +1 SD als Übergewicht, < -2 SD als Untergewicht.
const BMI_REF = {
  m: {
    12: [14.5, 15.8, 17.5, 19.9], 13: [14.9, 16.4, 18.2, 20.8], 14: [15.5, 17.0, 19.0, 21.8],
    15: [16.0, 17.6, 19.8, 22.7], 16: [16.5, 18.2, 20.5, 23.5], 17: [16.9, 18.8, 21.1, 24.3],
    18: [17.3, 19.2, 21.7, 24.9], 19: [17.6, 19.6, 22.2, 25.4],
  },
  f: {
    12: [14.4, 16.0, 18.0, 20.8], 13: [14.9, 16.6, 18.8, 21.8], 14: [15.4, 17.2, 19.6, 22.7],
    15: [15.9, 17.8, 20.2, 23.5], 16: [16.2, 18.2, 20.7, 24.1], 17: [16.4, 18.4, 21.0, 24.5],
    18: [16.4, 18.6, 21.3, 24.8], 19: [16.5, 18.7, 21.4, 25.0],
  },
};

export const MIN_AGE = 12;
// Tempo-Obergrenzen: Unter 18 wächst der Körper noch, deshalb bewusst langsam.
const LOSE_KG_PER_WEEK = { teen: 0.25, adult: 0.5 };
const GAIN_KG_PER_WEEK = { teen: 0.15, adult: 0.25 };
export const RAPID_LOSS_KG_PER_WEEK = 1;
export const WEIGH_IN_DAYS = 7;

function refFor(age, sex) {
  const year = Math.min(19, Math.max(MIN_AGE, Math.floor(age)));
  if (sex === 'm' || sex === 'f') return BMI_REF[sex][year];
  // Keine Angabe: pro Spalte der höhere Wert, damit die Untergrenze nie zu niedrig ausfällt.
  return BMI_REF.m[year].map((v, i) => Math.max(v, BMI_REF.f[year][i]));
}

const round1 = (n) => Math.round(n * 10) / 10;

export function assess({ age, sex, heightCm, weightKg }) {
  const [thin, low, median, high] = refFor(age, sex);
  const m2 = (heightCm / 100) ** 2;
  const bmi = weightKg / m2;
  const category = bmi < thin ? 'under' : bmi > high ? 'over' : 'normal';
  return {
    bmi: round1(bmi),
    category,
    minHealthyKg: Math.ceil(low * m2 * 10) / 10,
    medianKg: round1(median * m2),
    maxHealthyKg: Math.floor(high * m2 * 10) / 10,
  };
}

// Prüft ein Gewichtsziel. Gibt { ok, code, suggestedKg, limitKg } zurück; den Text zum code liefert die Übersetzung.
export function validateWeightGoal(profile, goal, targetKg) {
  const a = assess(profile);
  const current = profile.weightKg;

  if (goal === 'abnehmen') {
    if (a.category !== 'over') {
      return { ok: false, code: 'already_healthy' };
    }
    const suggestedKg = Math.min(round1(current - 1), a.maxHealthyKg);
    if (!(targetKg < current)) {
      return { ok: false, code: 'not_lower', suggestedKg };
    }
    if (targetKg < a.minHealthyKg) {
      return { ok: false, code: 'below_healthy', suggestedKg, limitKg: a.minHealthyKg };
    }
    return { ok: true, code: 'ok', suggestedKg };
  }

  if (goal === 'zunehmen') {
    if (current >= a.maxHealthyKg) {
      return { ok: false, code: 'already_upper' };
    }
    const suggestedKg = Math.max(round1(current + 1), a.minHealthyKg);
    if (!(targetKg > current)) {
      return { ok: false, code: 'not_higher', suggestedKg };
    }
    if (targetKg > a.maxHealthyKg) {
      return { ok: false, code: 'above_healthy', suggestedKg, limitKg: a.maxHealthyKg };
    }
    return { ok: true, code: 'ok', suggestedKg };
  }

  return { ok: true, code: 'ok' };
}

// Spanne statt Punktlandung: Fortschritt ist nie linear, und Jugendliche wachsen nebenbei.
export function weightPrognosis(profile, goal, targetKg) {
  const group = profile.age < 18 ? 'teen' : 'adult';
  const rate = (goal === 'abnehmen' ? LOSE_KG_PER_WEEK : GAIN_KG_PER_WEEK)[group];
  const diff = Math.abs(profile.weightKg - targetKg);
  const weeksMin = Math.max(1, Math.ceil(diff / rate));
  return { weeksMin, weeksMax: Math.ceil(weeksMin * 1.5), rateKgPerWeek: rate };
}

// Bewertet eine neue Wiege-Eingabe. Bei Warnsignalen pausiert die App das Gewichtsziel.
export function checkWeighIn(profile, goal, targetKg, previousKg, newKg, daysSince) {
  const a = assess({ ...profile, weightKg: newKg });
  const weeks = Math.max(1, daysSince / 7);
  const lostPerWeek = (previousKg - newKg) / weeks;

  if (goal === 'abnehmen' && newKg < a.minHealthyKg) return { status: 'pause', reason: 'below_healthy' };
  if (a.category === 'under') return { status: 'pause', reason: 'underweight' };
  if (lostPerWeek > RAPID_LOSS_KG_PER_WEEK) return { status: 'warn', reason: 'too_fast' };
  const reached = goal === 'abnehmen' ? newKg <= targetKg : newKg >= targetKg;
  return { status: reached ? 'reached' : 'ok' };
}
