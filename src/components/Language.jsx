// Sprache der App. Die Wahl liegt in einem eigenen localStorage-Schlüssel, getrennt vom Spielstand.
import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import {
  LANGUAGES, createTranslator, loadLanguage, saveLanguage,
} from '../i18n.js';

const LanguageContext = createContext(null);

export const useLanguage = () => useContext(LanguageContext);
export const useT = () => useContext(LanguageContext).t;

export function LanguageProvider({ children }) {
  const [language, setCurrent] = useState(loadLanguage);
  const t = useMemo(() => createTranslator(language), [language]);
  const setLanguage = useCallback((code) => {
    saveLanguage(code);
    setCurrent(code);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = t('app.title');
  }, [language, t]);

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

// Sprachnamen bleiben unübersetzt, damit jeder seine Sprache auch in einer fremden Oberfläche findet.
export function LanguageSelect() {
  const { language, setLanguage, t } = useLanguage();
  return (
    <ToggleButtonGroup
      exclusive
      fullWidth
      color="secondary"
      aria-label={t('language.label')}
      value={language}
      onChange={(_, value) => value && setLanguage(value)}
      sx={{ bgcolor: 'background.paper' }}
    >
      {LANGUAGES.map((l) => (
        <ToggleButton key={l.code} value={l.code} lang={l.code} data-lang={l.code} sx={{ minHeight: 48, textTransform: 'none', fontWeight: 800 }}>
          {l.name}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
