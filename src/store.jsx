// App-Zustand: Alle Daten bleiben im localStorage. Die Spiellogik selbst liegt in game.js, plan.js und health.js.
import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import { QUOTE_COUNT } from './data.js';
import {
  completeHabit, dateKey, logActivity, newGameState, parseKey, reconcile,
} from './game.js';
import { checkWeighIn } from './health.js';
import { EMOTES } from './components/Bear.jsx';
import { useT } from './components/Language.jsx';
import { buildPlan, dayIndex } from './plan.js';

const STORAGE_KEY = 'milo.v1';
const MiloContext = createContext(null);

export const today = () => dateKey(new Date());
export const useMilo = () => useContext(MiloContext);

const randomInt = (max) => Math.floor(Math.random() * max);
const restChecker = (plan) => (date) => plan.week[dayIndex(date)] === 'rest';
const persist = (store) => localStorage.setItem(STORAGE_KEY, JSON.stringify(store));

function boot() {
  let store = {};
  try {
    store = JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {};
  } catch {
    store = {};
  }
  const events = store.profile ? reconcile(store.game, today(), restChecker(store.plan)) : [];
  return { store, events };
}

function advanceQuote(store) {
  const current = store.quoteIdx ?? 0;
  store.quoteIdx = (current + 1 + randomInt(QUOTE_COUNT - 1)) % QUOTE_COUNT;
}

function describe(events, chooseEmote, t) {
  const lines = [];
  let title = '';
  let emote = '';
  for (const e of events) {
    if (e.type === 'activity' || e.type === 'perfect_day') {
      title ||= t(e.type === 'activity' ? 'celebrate.strong' : 'celebrate.perfect');
      lines.push(e.xp > 0 ? t('celebrate.xp', { xp: e.xp }) : t('celebrate.xpLimit'));
    }
    if (e.type === 'streak') lines.unshift(t('celebrate.streak', { count: e.count }));
    if (e.type === 'freeze_earned') lines.push(t('celebrate.freezeEarned'));
    if (e.type === 'promoted') {
      title = t('celebrate.promoted', { league: t(`league.${e.league}`) });
      emote = 'cup';
    }
    if (e.type === 'trophy') {
      title = t('celebrate.trophy', { name: t(`trophy.${e.trophy.id}.name`) });
      emote = 'cup';
      lines.push(`${e.trophy.emoji} ${t(`trophy.${e.trophy.id}.text`)}`);
    }
    if (e.type === 'goal') {
      title = t('celebrate.goal');
      lines.push(t('celebrate.goalNext'));
    }
  }
  return title ? { title, lines, emote: emote || chooseEmote() } : null;
}

function quietMessage(events, t) {
  for (const e of events) {
    if (e.type === 'freeze') return t('toast.freeze');
    if (e.type === 'streak_lost') return t('toast.streakLost');
    if (e.type === 'habit') return t('celebrate.xp', { xp: e.xp });
  }
  return '';
}

export function MiloProvider({ children }) {
  const t = useT();
  const [initial] = useState(boot);
  const [store, setStore] = useState(initial.store);
  const [celebration, setCelebration] = useState(null);
  const [toast, setToast] = useState(null);
  const [overlay, setOverlay] = useState(null); // { kind: 'picker' | 'workout' | 'log', ... }
  const [editing, setEditing] = useState(false);
  const storeRef = useRef(initial.store);
  const lastEmote = useRef('');
  const overlayRef = useRef(null);
  overlayRef.current = overlay;
  // Als Ref, damit ein Sprachwechsel die Events beim Start nicht noch einmal auslöst.
  const tRef = useRef(t);
  tRef.current = t;

  // Änderungen laufen auf einer Kopie und werden sofort gespeichert, weil pagehide nicht auf React warten kann.
  const update = useCallback((change) => {
    const next = structuredClone(storeRef.current);
    const result = change(next);
    storeRef.current = next;
    persist(next);
    setStore(next);
    return result;
  }, []);

  const chooseEmote = useCallback(() => {
    const options = EMOTES.filter((e) => e !== lastEmote.current);
    lastEmote.current = options[randomInt(options.length)];
    return lastEmote.current;
  }, []);

  const showToast = useCallback((text) => setToast({ text, key: Date.now() }), []);

  const announce = useCallback((events) => {
    const message = quietMessage(events, tRef.current);
    if (message) showToast(message);
    const next = describe(events, chooseEmote, tRef.current);
    if (next) setCelebration(next);
  }, [chooseEmote, showToast]);

  const syncDay = useCallback(() => {
    const current = storeRef.current;
    if (!current.profile) return;
    announce(update((s) => reconcile(s.game, today(), restChecker(s.plan))));
  }, [announce, update]);

  useEffect(() => {
    if (!storeRef.current.profile) return;
    persist(storeRef.current);
    announce(initial.events);
  }, [announce, initial.events]);

  // Neuer Spruch bei jedem Verlassen. leftApp verhindert doppeltes Weiterschalten,
  // wenn visibilitychange und pagehide beide feuern.
  useEffect(() => {
    let leftApp = false;
    const onLeave = () => {
      if (leftApp || !storeRef.current.profile) return;
      leftApp = true;
      update(advanceQuote);
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        onLeave();
        return;
      }
      leftApp = false;
      if (overlayRef.current?.kind !== 'workout') syncDay();
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onLeave);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onLeave);
    };
  }, [syncDay, update]);

  const actions = useMemo(() => ({
    update,
    announce,
    setOverlay,
    setEditing,
    setCelebration,
    setToast,
    showToast,
    chooseEmote,
    nextQuote: () => update(advanceQuote),
    logActivity: (entry) => announce(update((s) => logActivity(s.game, today(), entry))),
    completeHabit: (id) => announce(update((s) => completeHabit(s.game, today(), id))),
    savePicks: (type, ids) => update((s) => {
      s.picks = { ...s.picks, [type]: ids };
    }),
    saveProfile: (profile) => {
      update((s) => {
        const weightChanged = s.profile?.weightKg !== profile.weightKg;
        s.profile = profile;
        s.plan = buildPlan(profile, today());
        s.game ??= newGameState(today());
        s.quoteIdx ??= randomInt(QUOTE_COUNT);
        s.goalPaused = false;
        if (weightChanged) s.weights = [...(s.weights ?? []), { day: today(), kg: profile.weightKg }];
      });
      setEditing(false);
    },
    weighIn: (kg) => {
      const result = update((s) => {
        const { profile } = s;
        const last = s.weights.at(-1);
        const daysSince = Math.max(1, Math.round((parseKey(today()) - parseKey(last.day)) / 864e5));
        const check = checkWeighIn(profile, profile.goal, profile.targetKg, last.kg, kg, daysSince);
        s.weights.push({ day: today(), kg });
        profile.weightKg = kg;
        if (check.status === 'pause') s.goalPaused = true;
        if (check.status === 'reached') {
          profile.goal = 'gesund';
          delete profile.targetKg;
        }
        if (check.status !== 'pause') s.plan = buildPlan(profile, today());
        return check;
      });
      if (result.status === 'reached') {
        announce([{ type: 'goal' }]);
      }
      if (result.status === 'warn') showToast(tRef.current('toast.tooFast'));
      if (result.status === 'ok') showToast(tRef.current('toast.checkIn'));
    },
    resetAll: () => {
      localStorage.removeItem(STORAGE_KEY);
      storeRef.current = {};
      setStore({});
      setEditing(false);
    },
  }), [announce, chooseEmote, showToast, update]);

  const value = useMemo(() => ({
    store, celebration, toast, overlay, editing, ...actions,
  }), [store, celebration, toast, overlay, editing, actions]);

  return <MiloContext.Provider value={value}>{children}</MiloContext.Provider>;
}
