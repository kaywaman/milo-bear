import test from 'node:test';
import assert from 'node:assert/strict';
import { assess, checkWeighIn, validateWeightGoal, weightPrognosis } from '../src/health.js';
import {
  LEVELS, MAX_PICKS, MIN_PICKS, PICKER_TYPES, buildPlan, buildWorkout, defaultPicks, exercisePool, quietPicks, randomPicks,
} from '../src/plan.js';
import {
  DAILY_XP_CAP, addDays, completeHabit, dateKey, leaderboard, logActivity, newGameState, parseKey, reconcile, weekKey,
} from '../src/game.js';
import { HABITS } from '../src/data.js';

const teen = { age: 14, sex: 'f', heightCm: 160, weightKg: 75 }; // BMI 29.3, über +1 SD
const fitTeen = { age: 14, sex: 'f', heightCm: 160, weightKg: 50 }; // BMI 19.5, normal
const never = () => false;

test('assess nutzt die WHO-Werte für Alter und Geschlecht', () => {
  assert.equal(assess(teen).category, 'over');
  assert.equal(assess(fitTeen).category, 'normal');
  assert.equal(assess({ ...fitTeen, weightKg: 37 }).category, 'under');
  assert.equal(assess(fitTeen).minHealthyKg, 44.1); // 17.2 * 1.6²
});

test('Abnehmziel wird bei normalem Gewicht abgelehnt', () => {
  const r = validateWeightGoal(fitTeen, 'abnehmen', 45);
  assert.equal(r.ok, false);
  assert.equal(r.code, 'already_healthy');
});

test('Abnehmziel unter der gesunden Spanne wird abgelehnt, sinnvolles erlaubt', () => {
  assert.equal(validateWeightGoal(teen, 'abnehmen', 40).code, 'below_healthy');
  assert.equal(validateWeightGoal(teen, 'abnehmen', 76).code, 'not_lower');
  assert.equal(validateWeightGoal(teen, 'abnehmen', 65).ok, true);
});

test('Zunehmziel ist nach oben begrenzt', () => {
  assert.equal(validateWeightGoal(teen, 'zunehmen', 80).code, 'already_upper');
  assert.equal(validateWeightGoal(fitTeen, 'zunehmen', 90).code, 'above_healthy');
  assert.equal(validateWeightGoal(fitTeen, 'zunehmen', 53).ok, true);
});

test('Prognose bleibt bei Jugendlichen langsam und ist eine Spanne', () => {
  const p = weightPrognosis(teen, 'abnehmen', 70);
  assert.equal(p.weeksMin, 20); // 5 kg bei 0,25 kg/Woche
  assert.equal(p.weeksMax, 30);
  assert.equal(weightPrognosis({ ...teen, age: 25 }, 'abnehmen', 70).weeksMin, 10);
});

test('Wiegen pausiert das Ziel bei Warnsignalen', () => {
  assert.equal(checkWeighIn(teen, 'abnehmen', 65, 75, 74.8, 7).status, 'ok');
  assert.equal(checkWeighIn(teen, 'abnehmen', 65, 75, 73, 7).reason, 'too_fast');
  assert.equal(checkWeighIn(teen, 'abnehmen', 40, 46, 43, 7).status, 'pause');
  assert.equal(checkWeighIn(teen, 'abnehmen', 65, 65.2, 65, 7).status, 'reached');
});

test('Plan hat die gewünschten Trainingstage und immer einen Ruhetag', () => {
  for (const daysPerWeek of [2, 3, 4, 5, 6]) {
    const plan = buildPlan({ ...fitTeen, goal: 'kraft', level: 2, daysPerWeek }, '2026-11-02');
    assert.equal(plan.week.filter((d) => d !== 'rest').length, daysPerWeek);
    assert.ok(plan.week.includes('rest'));
    assert.ok(plan.prognosis.weeksMin > 0);
  }
});

test('Jede Trainingsart hat fünf Übungen pro Runde und dauert so lange wie angezeigt', () => {
  for (const type of ['kraft', 'cardio', 'mix']) {
    for (const level of [1, 2, 3]) {
      const w = buildWorkout(type, level);
      assert.equal(w.steps.filter((s) => !s.pause).length, w.rounds * 5);
      const minutes = w.steps.reduce((sum, s) => sum + s.seconds, 0) / 60;
      assert.ok(Math.abs(minutes - LEVELS[level].minutes) <= LEVELS[level].minutes * 0.1, `${type}/${level}: ${minutes} Min.`);
    }
  }
});

test('Cardio und Ganzkörper bieten genug Auswahl, auch ohne Springen', () => {
  for (const type of PICKER_TYPES) {
    assert.ok(exercisePool(type).length >= 10);
    assert.equal(defaultPicks(type).length, 5);
    assert.equal(quietPicks(type).length, 5);
    assert.ok(quietPicks(type).every((id) => exercisePool(type).find((e) => e.id === id).quiet));
    assert.equal(new Set(randomPicks(type)).size, 5);
  }
});

test('Eigene Auswahl wird trainiert und hält die Dauer ungefähr ein', () => {
  for (const type of PICKER_TYPES) {
    const ids = exercisePool(type).map((e) => e.id);
    for (let count = MIN_PICKS; count <= MAX_PICKS; count++) {
      for (const level of [1, 2, 3]) {
        const picks = ids.slice(-count);
        const w = buildWorkout(type, level, picks);
        assert.deepEqual([...new Set(w.steps.filter((s) => !s.pause).map((s) => s.id))], picks);
        assert.ok(Math.abs(w.minutes - LEVELS[level].minutes) <= LEVELS[level].minutes * 0.2, `${type}/${count}/${level}: ${w.minutes}`);
      }
    }
  }
});

test('Ungültige oder zu kleine Auswahl fällt auf die Empfehlung zurück', () => {
  const steps = (ids) => buildWorkout('cardio', 1, ids).steps.filter((s) => !s.pause).map((s) => s.id);
  const recommended = defaultPicks('cardio');
  assert.deepEqual([...new Set(steps(['hampelmann']))], recommended);
  assert.deepEqual([...new Set(steps(['gibtsnicht', 'auchnicht', 'nein']))], recommended);
});

test('Streak wächst nur einmal pro Tag', () => {
  const s = newGameState('2026-11-02');
  logActivity(s, '2026-11-02', { kind: 'workout' });
  logActivity(s, '2026-11-02', { kind: 'outdoor', minutes: 20 });
  assert.equal(s.streak.count, 1);
  reconcile(s, '2026-11-03', never);
  logActivity(s, '2026-11-03', { kind: 'workout' });
  assert.equal(s.streak.count, 2);
});

test('Freeze rettet genau einen verpassten Tag, auch bei mehrfachem Öffnen', () => {
  const s = newGameState('2026-11-02');
  logActivity(s, '2026-11-02', { kind: 'workout' });
  reconcile(s, '2026-11-04', never);
  reconcile(s, '2026-11-04', never);
  assert.equal(s.streak.count, 1);
  assert.equal(s.streak.freezes, 0);
  reconcile(s, '2026-11-06', never);
  assert.equal(s.streak.count, 0);
});

test('Ruhetage brechen den Streak nicht und kosten keinen Freeze', () => {
  const s = newGameState('2026-11-02');
  logActivity(s, '2026-11-02', { kind: 'workout' });
  reconcile(s, '2026-11-06', () => true);
  assert.equal(s.streak.count, 1);
  assert.equal(s.streak.freezes, 1);
});

test('Aktive Tage werden für die Wochenanzeige gemerkt, auch ohne Eintrag im Log', () => {
  const s = newGameState('2026-11-02');
  HABITS.forEach((h) => completeHabit(s, '2026-11-02', h.id));
  assert.deepEqual(s.activeDays, ['2026-11-02']);
  delete s.activeDays; // Spielstand aus einer älteren Version
  reconcile(s, '2026-11-03', never);
  logActivity(s, '2026-11-03', { kind: 'workout' });
  assert.deepEqual(s.activeDays, ['2026-11-03']);
});

test('Tages-XP sind gedeckelt', () => {
  const s = newGameState('2026-11-02');
  for (let i = 0; i < 10; i++) logActivity(s, '2026-11-02', { kind: 'workout' });
  assert.equal(s.xp, DAILY_XP_CAP);
});

test('Gewohnheiten zählen einmal, der perfekte Tag zählt für den Streak', () => {
  const s = newGameState('2026-11-02');
  completeHabit(s, '2026-11-02', 'wasser');
  completeHabit(s, '2026-11-02', 'wasser');
  assert.equal(s.xp, 5);
  assert.equal(s.streak.count, 0);
  HABITS.forEach((h) => completeHabit(s, '2026-11-02', h.id));
  assert.equal(s.streak.count, 1);
  assert.equal(s.stats.perfectDays, 1);
});

test('Pokale werden nur einmal vergeben', () => {
  const s = newGameState('2026-11-02');
  const first = logActivity(s, '2026-11-02', { kind: 'workout' }).filter((e) => e.type === 'trophy');
  const second = logActivity(s, '2026-11-02', { kind: 'workout' }).filter((e) => e.type === 'trophy');
  assert.ok(first.some((e) => e.trophy.id === 'erster'));
  assert.equal(second.length, 0);
});

test('Liga: Rangliste ist stabil und die Wochenwertung befördert', () => {
  const s = newGameState('2026-11-02');
  s.league.xp = 5000;
  assert.deepEqual(leaderboard(s, '2026-11-04'), leaderboard(s, '2026-11-04'));
  assert.equal(leaderboard(s, '2026-11-04').length, 10);
  const events = reconcile(s, '2026-11-09', never);
  assert.equal(s.league.index, 1);
  assert.equal(s.league.xp, 0);
  assert.ok(events.some((e) => e.type === 'promoted'));
  assert.ok(events.some((e) => e.type === 'trophy' && e.trophy.id === 'liga'));
});

test('Liga: Mitspieler haben eindeutige Namen und streuen deutlich', () => {
  const s = newGameState('2026-11-02');
  const bots = leaderboard(s, '2026-11-08').filter((r) => r.bot);
  assert.equal(new Set(bots.map((b) => b.name)).size, bots.length);
  const xp = bots.map((b) => b.xp);
  assert.ok(Math.max(...xp) - Math.min(...xp) > 50, xp.join());
});

test('Datumshelfer rechnen über die Zeitumstellung korrekt', () => {
  assert.equal(addDays('2026-10-24', 2), '2026-10-26');
  assert.equal(weekKey('2026-11-08'), '2026-11-02');
  assert.equal(dateKey(parseKey('2026-03-29')), '2026-03-29');
});
