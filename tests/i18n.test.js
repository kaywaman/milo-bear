import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_LANGUAGE, LANGUAGES, MESSAGES, createTranslator, loadLanguage, saveLanguage,
} from '../src/i18n.js';
import {
  EXERCISES, HABITS, LEAGUES, OUTDOOR, QUOTE_COUNT, TROPHIES,
} from '../src/data.js';
import { GOALS, LEVELS, PICKER_TYPES, SESSION_TYPES } from '../src/plan.js';

const PLURAL = (node) => Object.keys(node).includes('other');

// Zerlegt die Texte in Pfad -> Text, Pluralformen zählen als ein Eintrag mit allen Formen.
function flatten(node, prefix = '', out = {}) {
  for (const [key, value] of Object.entries(node)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') out[path] = value;
    else if (PLURAL(value)) out[path] = Object.values(value).join(' ');
    else flatten(value, path, out);
  }
  return out;
}
const placeholders = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
const reference = flatten(MESSAGES[DEFAULT_LANGUAGE]);

test('Englisch ist die Standardsprache', () => {
  assert.equal(DEFAULT_LANGUAGE, 'en');
  assert.deepEqual(LANGUAGES.map((l) => l.code), ['en', 'de', 'es']);
  assert.equal(loadLanguage(), 'en'); // Ohne localStorage, wie im privaten Modus
});

for (const { code } of LANGUAGES) {
  const messages = flatten(MESSAGES[code]);

  test(`${code}: hat genau dieselben Texte wie Englisch`, () => {
    assert.deepEqual(Object.keys(messages).sort(), Object.keys(reference).sort());
  });

  test(`${code}: Platzhalter stimmen mit Englisch überein`, () => {
    for (const [key, text] of Object.entries(reference)) {
      assert.deepEqual([...new Set(placeholders(messages[key]))], [...new Set(placeholders(text))], key);
    }
  });

  test(`${code}: Jede ID aus der Logik hat einen Text`, () => {
    const t = createTranslator(code);
    const keys = [
      ...EXERCISES.flatMap((e) => [`exercise.${e.id}.name`, `exercise.${e.id}.how`]),
      ...TROPHIES.flatMap((x) => [`trophy.${x.id}.name`, `trophy.${x.id}.text`]),
      ...HABITS.map((h) => `habit.${h.id}`),
      ...OUTDOOR.map((o) => `outdoor.${o.id}`),
      ...LEAGUES.map((l) => `league.${l.id}`),
      ...Object.keys(SESSION_TYPES).map((id) => `session.${id}`),
      ...Object.keys(GOALS).flatMap((id) => [`goal.${id}.label`, `goal.${id}.text`]),
      ...Object.keys(LEVELS).flatMap((id) => [`level.${id}.label`, `level.${id}.text`]),
      ...['kraft', 'ausdauer', 'gesund'].flatMap((g) => Object.keys(LEVELS).map((l) => `target.${g}.${l}`)),
      ...PICKER_TYPES.map((type) => `picker.title.${type}`),
      ...['already_healthy', 'not_lower', 'below_healthy', 'already_upper', 'not_higher', 'above_healthy'].map((c) => `weightGoal.${c}`),
    ];
    for (const key of keys) assert.notEqual(t(key), key, key);
  });

  test(`${code}: Sprüche und Tage sind vollständig`, () => {
    assert.equal(MESSAGES[code].quotes.length, QUOTE_COUNT);
    assert.equal(new Set(MESSAGES[code].quotes).size, QUOTE_COUNT);
    assert.equal(new Set(MESSAGES[code].days).size, 7);
  });
}

test('Texte in Deutsch und Spanisch sind wirklich übersetzt', () => {
  const same = (code) => Object.keys(reference).filter((k) => flatten(MESSAGES[code])[k] === reference[k]);
  // Gleich lauten dürfen nur Fachwörter und reine Platzhalter.
  const allowed = new Set([
    'nav.plan', 'session.cardio', 'celebrate.xp', 'league.bronze', 'league.gold', 'home.streak', 'exercise.superman.name',
    'home.hello', 'week.minutes',
  ]);
  for (const code of ['de', 'es']) {
    const unexpected = same(code).filter((k) => !allowed.has(k) && reference[k].length > 6);
    assert.deepEqual(unexpected, [], code);
  }
});

test('Hilfetelefone passen zur Sprache, statt nur übersetzt zu sein', () => {
  const directory = 'childhelplineinternational.org/helplines';
  const support = (code) => MESSAGES[code].support.replaceAll('\u00a0', ' '); // Nummern brechen nicht um
  for (const { code } of LANGUAGES) assert.ok(support(code).includes(directory), code);
  assert.ok(support('de').includes('116 111'));
  assert.ok(support('en').includes('0800 1111') && support('en').includes('988'));
  assert.ok(support('es').includes('900 20 20 10') && support('es').includes('800 911 2000'));
  assert.ok(!support('en').includes('116 111') && !support('es').includes('116 111'));
});

test('Platzhalter und Pluralformen', () => {
  const de = createTranslator('de');
  const es = createTranslator('es');
  assert.equal(de('home.hello', { name: 'Sam' }), 'Hi Sam!');
  assert.equal(de('celebrate.streak', { count: 1 }), '🔥 1 Tag Streak');
  assert.equal(de('celebrate.streak', { count: 5 }), '🔥 5 Tage Streak');
  assert.equal(es('celebrate.streak', { count: 1 }), '🔥 Racha de 1 día');
  assert.equal(es('picker.exercises', { count: 0 }), '0 ejercicios');
  assert.equal(es('picker.exercises', { count: 1000000 }), '1000000 ejercicios'); // Spanisch kennt die Form "many"
});

test('Zahlen und Daten folgen der Sprache', () => {
  const date = new Date(2026, 10, 9);
  const month = { month: 'long', year: 'numeric' };
  assert.equal(createTranslator('en').number(72.5), '72.5');
  assert.equal(createTranslator('de').number(72.5), '72,5');
  assert.equal(createTranslator('es').number(72.5), '72,5');
  assert.equal(createTranslator('en').date(date, month), 'November 2026');
  assert.equal(createTranslator('de').date(date, month), 'November 2026');
  assert.equal(createTranslator('es').date(date, month), 'noviembre de 2026');
});

test('Fehlender Text fällt auf Englisch und dann auf den Schlüssel zurück', () => {
  const t = createTranslator('de');
  MESSAGES.en.onlyEnglish = 'Only English';
  assert.equal(t('onlyEnglish'), 'Only English');
  delete MESSAGES.en.onlyEnglish;
  assert.equal(t('gibt.es.nicht'), 'gibt.es.nicht');
});

test('Sprachwahl wird gespeichert, Unbekanntes führt zu Englisch', () => {
  const data = new Map();
  globalThis.localStorage = { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => data.set(k, v) };
  try {
    assert.equal(loadLanguage(), 'en');
    saveLanguage('es');
    assert.equal(loadLanguage(), 'es');
    saveLanguage('xx');
    assert.equal(loadLanguage(), 'en');
    saveLanguage('toString'); // Nicht auf geerbte Objekt-Eigenschaften hereinfallen
    assert.equal(loadLanguage(), 'en');
  } finally {
    delete globalThis.localStorage;
  }
});
