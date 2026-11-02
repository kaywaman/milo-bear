// Übersetzung ohne React, damit Store und Tests sie genauso nutzen können wie die Screens.
// Texte liegen in src/locales/. Logik und Spielstand enthalten nur IDs und Codes, nie fertige Sätze.
import de from './locales/de.js';
import en from './locales/en.js';
import es from './locales/es.js';

export const MESSAGES = { en, de, es };
export const DEFAULT_LANGUAGE = 'en';
export const LANGUAGES = [
  { code: 'en', name: 'English', locale: 'en' },
  { code: 'de', name: 'Deutsch', locale: 'de-DE' },
  { code: 'es', name: 'Español', locale: 'es' },
];

const STORAGE_KEY = 'milo.lang';

export function loadLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return Object.hasOwn(MESSAGES, saved) ? saved : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE; // Privater Modus
  }
}

export function saveLanguage(code) {
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // Ohne Speicher gilt die Wahl nur bis zum Neuladen.
  }
}

const lookup = (messages, key) => key.split('.').reduce((node, part) => node?.[part], messages);

// t('home.hello', { name }) setzt {name} ein. Mit params.count wählt t die passende Pluralform.
export function createTranslator(code) {
  const { locale } = LANGUAGES.find((l) => l.code === code);
  const plurals = new Intl.PluralRules(locale);
  const numbers = new Intl.NumberFormat(locale, { maximumFractionDigits: 2, useGrouping: false });

  const t = (key, params = {}) => {
    let value = lookup(MESSAGES[code], key) ?? lookup(MESSAGES[DEFAULT_LANGUAGE], key) ?? key;
    if (typeof value === 'object') value = value[plurals.select(params.count)] ?? value.other;
    return value.replace(/\{(\w+)\}/g, (match, name) => params[name] ?? match);
  };
  t.number = (n) => numbers.format(n);
  t.date = (date, options) => date.toLocaleDateString(locale, options);
  return t;
}
