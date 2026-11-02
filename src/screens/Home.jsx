import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import AutorenewRounded from '@mui/icons-material/AutorenewRounded';
import Bear from '../components/Bear.jsx';
import { useT } from '../components/Language.jsx';
import { BearStage, Section } from '../components/parts.jsx';
import { ModeToggle } from '../components/ThemeMode.jsx';
import { HABITS } from '../data.js';
import { addDays, weekKey } from '../game.js';
import {
  PICKER_TYPES, SESSION_TYPES, buildWorkout, dayIndex,
} from '../plan.js';
import { today, useMilo } from '../store.jsx';

function SessionCard() {
  const t = useT();
  const { store, setOverlay } = useMilo();
  const { plan, game, profile } = store;
  const type = plan.week[dayIndex(new Date())];
  const label = t(`session.${type}`);
  const done = game.log.some((l) => l.day === today() && l.kind === 'workout');

  if (type === 'rest') {
    return (
      <Section title={t('home.restTitle')}>
        <Typography color="text.secondary">{t('home.restText')}</Typography>
      </Section>
    );
  }
  if (type === 'draussen') {
    return (
      <Section title={t('home.outdoorTitle', { minutes: plan.sessionMinutes })}>
        <Typography color="text.secondary">{t('home.outdoorText')}</Typography>
        <Button variant="contained" color="secondary" onClick={() => setOverlay({ kind: 'log' })} data-log>{t('home.logActivity')}</Button>
      </Section>
    );
  }
  if (done) {
    return (
      <Section title={t('home.doneTitle', { session: label })}>
        <Typography color="text.secondary">{t('home.doneText')}</Typography>
      </Section>
    );
  }
  const hasPicker = PICKER_TYPES.includes(type);
  const start = () => setOverlay(hasPicker
    ? { kind: 'picker', type }
    : { kind: 'workout', workout: buildWorkout(type, profile.level) });
  return (
    <Section title={t('home.todayTitle', { emoji: SESSION_TYPES[type].emoji, session: label })}>
      <Typography color="text.secondary">{t('home.noEquipment', { minutes: plan.sessionMinutes })}</Typography>
      <Button variant="contained" onClick={start} data-workout={type}>{t(hasPicker ? 'home.chooseExercises' : 'common.startWorkout')}</Button>
    </Section>
  );
}

function MovementCard() {
  const t = useT();
  const { store, setOverlay } = useMilo();
  const goal = store.plan.dailyMoveMinutes;
  const moved = store.game.log.filter((l) => l.day === today()).reduce((sum, l) => sum + (l.minutes || 0), 0);
  return (
    <Section title={t('home.movementTitle')}>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
        <Typography sx={{ fontSize: '1.6rem', fontWeight: 900, color: 'secondary.main', lineHeight: 1 }}>{moved}</Typography>
        <Typography color="text.secondary">{t('home.movementOf', { goal })}</Typography>
      </Box>
      <LinearProgress variant="determinate" color="secondary" value={Math.min(100, (moved / goal) * 100)} sx={{ height: 14, borderRadius: 7 }} />
      <Button variant="outlined" onClick={() => setOverlay({ kind: 'log' })} data-log>{t('home.logSport')}</Button>
    </Section>
  );
}

function HabitsCard() {
  const t = useT();
  const { store, completeHabit } = useMilo();
  return (
    <Section title={t('home.habitsTitle')}>
      <Box sx={{ display: 'grid' }}>
        {HABITS.map((h, i) => {
          const done = store.game.day.habits.includes(h.id);
          return (
            <ButtonBase
              key={h.id}
              disabled={done}
              data-habit={h.id}
              onClick={() => completeHabit(h.id)}
              sx={{
                justifyContent: 'flex-start', gap: 0.5, minHeight: 50, textAlign: 'left', font: 'inherit',
                borderTop: i ? 1.5 : 0, borderColor: 'divider', color: done ? 'text.secondary' : 'text.primary',
              }}
            >
              <Checkbox checked={done} color="secondary" tabIndex={-1} disableRipple slotProps={{ input: { 'aria-hidden': true } }} sx={{ pointerEvents: 'none', pl: 0 }} />
              <span>{h.emoji} {t(`habit.${h.id}`)}</span>
            </ButtonBase>
          );
        })}
      </Box>
    </Section>
  );
}

function Stat({ icon, value, label, ...rest }) {
  return (
    <Box sx={{ textAlign: 'center', minWidth: 0 }} {...rest}>
      <Box sx={{ fontSize: '1.3rem', fontWeight: 900, lineHeight: 1.2 }}>{icon} {value}</Box>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
    </Box>
  );
}

function WeekStrip() {
  const t = useT();
  const { store } = useMilo();
  const { game, plan } = store;
  const now = today();
  const monday = weekKey(now);
  const active = new Set([...(game.activeDays ?? []), ...game.log.map((l) => l.day)]);
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 0.5 }} aria-label={t('week.title')}>
      {plan.week.map((type, i) => {
        const key = addDays(monday, i);
        const done = active.has(key);
        const isToday = key === now;
        let mark = '';
        if (done) mark = '✓';
        else if (type === 'rest') mark = '·';
        return (
          <Box key={key} sx={{ display: 'grid', justifyItems: 'center', gap: 0.25 }} data-day={done ? 'done' : 'open'}>
            <Typography variant="caption" sx={{ fontWeight: isToday ? 900 : 700, color: isToday ? 'primary.main' : 'text.secondary' }}>{t(`days.${i}`)}</Typography>
            <Box
              sx={(t) => ({
                width: 30, height: 30, borderRadius: '50%', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: '.9rem',
                bgcolor: 'milo.muted', color: 'text.secondary',
                ...(done && { background: t.vars.palette.milo.primaryGradient, color: t.vars.palette.primary.contrastText }),
                ...(isToday && !done && { outline: `2px solid ${t.vars.palette.primary.main}`, outlineOffset: 1 }),
              })}
            >
              {mark}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

function ProgressCard() {
  const t = useT();
  const { streak, xp } = useMilo().store.game;
  return (
    <Card>
      <Box sx={{ p: 2, display: 'grid', gap: 1.5 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1 }}>
          <Stat icon="🔥" value={streak.count} label={t('home.streak')} title={t('home.streak')} data-testid="streak" />
          <Stat icon="🧊" value={streak.freezes} label={t('home.shield')} />
          <Stat icon="⚡" value={xp} label="XP" />
        </Box>
        <WeekStrip />
      </Box>
    </Card>
  );
}

function Hero() {
  const t = useT();
  const { store, chooseEmote, nextQuote } = useMilo();
  const [emote, setEmote] = useState('');
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const cheer = () => {
    setEmote(chooseEmote());
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setEmote(''), 2600);
  };

  return (
    <Box
      sx={(t) => ({
        background: t.vars.palette.milo.heroGradient,
        borderRadius: 3,
        p: 2,
        display: 'grid',
        gap: 1.5,
        alignItems: 'center',
        gridTemplateColumns: { xs: '118px minmax(0, 1fr)', md: 'minmax(0, 1fr)' },
        '@media (max-width: 359px)': { gridTemplateColumns: 'minmax(0, 1fr)' },
      })}
    >
      <ButtonBase
        aria-label={t('home.cheer')}
        onClick={cheer}
        data-bear
        sx={{ display: 'block', mx: 'auto', width: { xs: '100%', md: 240 }, maxWidth: 240, borderRadius: 3, overflow: 'visible' }}
      >
        <BearStage><Bear key={emote} emote={emote} /></BearStage>
      </ButtonBase>
      <Box
        sx={{
          position: 'relative', bgcolor: 'background.paper', borderRadius: 2.5, p: 1.5, display: 'grid', gap: 0.75,
          '&::before': {
            content: '""', position: 'absolute', width: 16, height: 16, bgcolor: 'background.paper', transform: 'rotate(45deg)', borderRadius: '3px',
            left: { xs: -6, md: 'calc(50% - 8px)' },
            top: { xs: 'calc(50% - 8px)', md: -6 },
            '@media (max-width: 359px)': { left: 'calc(50% - 8px)', top: -6 },
          },
        }}
      >
        <Typography sx={{ fontWeight: 900, position: 'relative', overflowWrap: 'anywhere' }}>{t('home.hello', { name: store.profile.nickname })}</Typography>
        <Typography data-testid="quote" sx={{ fontWeight: 700, lineHeight: 1.3, position: 'relative' }}>{t(`quotes.${store.quoteIdx ?? 0}`)}</Typography>
        <Button size="small" startIcon={<AutorenewRounded />} onClick={nextQuote} data-quote color="primary" sx={{ minHeight: 44, justifySelf: 'start', ml: -0.75, px: 0.75 }}>
          {t('home.newQuote')}
        </Button>
      </Box>
    </Box>
  );
}

export default function Home() {
  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.25 }}>
        <Typography variant="h1" component="h1" sx={{ color: 'primary.main' }}>Milo</Typography>
        <ModeToggle />
      </Box>
      <Box sx={{ display: 'grid', gap: 1.5, alignItems: 'start', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) minmax(0, 1fr)' } }}>
        <Box sx={{ display: 'grid', gap: 1.5, minWidth: 0 }}>
          <Hero />
          <ProgressCard />
        </Box>
        <Box sx={{ display: 'grid', gap: 1.5, minWidth: 0 }}>
          <SessionCard />
          <MovementCard />
          <HabitsCard />
        </Box>
      </Box>
    </>
  );
}
