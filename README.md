# Milo – Fitness-App für Jugendliche ab 12

Installierbare Web-App (PWA) mit Milo dem Brillenbären, gebaut mit React, MUI und Vite.

    npm install
    npm start          # Entwicklung, auch im WLAN erreichbar (Adresse steht im Terminal)
    npm test           # Tests der Logik
    npm run build      # Fertige App in dist/ für statisches Hosting
    npm run preview    # Build lokal ansehen

Das Installieren aufs iPhone (Safari → Teilen → „Zum Home-Bildschirm“) und der Offline-Modus
brauchen HTTPS, also ein gehostetes `dist/`.

## Aufbau

- `src/health.js`: Schutzgrenzen für Gewichtsziele auf Basis der WHO-Referenz 2007
- `src/plan.js`: Wochenplan, Training, Übungsauswahl, Prognose
- `src/game.js`: Streaks, XP, Liga, Pokale
- `src/data.js`: Übungen, Gewohnheiten, Ligen und Pokale als IDs, ohne Texte
- `src/i18n.js`, `src/locales/`: Übersetzungen für Englisch (Standard), Deutsch und Spanisch
- `src/components/Language.jsx`: Sprachauswahl und `useT()` für die Screens
- `src/store.jsx`: App-Zustand und Speichern
- `src/theme.js`: MUI-Theme mit hellem und dunklem Farbschema
- `src/components/ThemeMode.jsx`: Umschalter für die Darstellung
- `src/screens/`, `src/components/`: Oberfläche; Milos Emotes liegen in `src/bear.css`, die übrigen Animationen in `src/motion.css`

Alle Nutzerdaten liegen nur im `localStorage` des Geräts. Die Liga-Mitspieler sind simuliert.

## Übersetzungen

Logik und Spielstand speichern nur IDs und Codes, Texte entstehen erst beim Anzeigen. Eine neue Sprache
braucht eine Datei in `src/locales/` und einen Eintrag in `LANGUAGES` in `src/i18n.js`. `npm test` meldet
fehlende Texte und abweichende Platzhalter.

Der Eintrag `support` nennt Hilfetelefone und wird nicht einfach übersetzt: Nummern gelten je Land,
nicht je Sprache. Vor einer Veröffentlichung bitte prüfen, ob sie noch stimmen.
