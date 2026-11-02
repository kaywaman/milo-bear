import { useEffect, useReducer } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import { useT } from '../components/Language.jsx';
import { useMilo } from '../store.jsx';

const LANDSCAPE = '@media (orientation: landscape) and (max-height: 500px)';
const SHORT = '@media (orientation: portrait) and (max-height: 660px)';

function next(state, steps) {
  const index = state.index + 1;
  return { ...state, index, remaining: steps[index]?.seconds ?? 0 };
}

function reducer(state, action) {
  if (action.type === 'pause') return { ...state, paused: !state.paused };
  if (action.type === 'skip') return next(state, action.steps);
  // Tick: Nur wirklich trainierte Zeit zählt für die Bewegungsminuten.
  const ticked = { ...state, remaining: state.remaining - 1, elapsed: state.elapsed + 1 };
  return ticked.remaining <= 0 ? next(ticked, action.steps) : ticked;
}

// Hält das Display während des Trainings an, sonst stoppt der Timer auf dem iPhone mit der Sperre.
function useWakeLock() {
  useEffect(() => {
    let lock = null;
    let active = true;
    const request = async () => {
      try {
        const granted = await navigator.wakeLock?.request('screen');
        if (active) lock = granted;
        else granted?.release();
      } catch {
        // Ohne Wake Lock läuft das Training trotzdem, nur das Display kann ausgehen.
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') request();
    };
    request();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      active = false;
      document.removeEventListener('visibilitychange', onVisibility);
      lock?.release();
    };
  }, []);
}

export default function Workout({ workout }) {
  const t = useT();
  const { setOverlay, logActivity } = useMilo();
  const { steps, rounds } = workout;
  const [state, dispatch] = useReducer(reducer, {
    index: 0, remaining: steps[0].seconds, paused: false, elapsed: 0,
  });
  const finished = state.index >= steps.length;
  useWakeLock();

  useEffect(() => {
    if (state.paused || finished) return undefined;
    const id = setInterval(() => dispatch({ type: 'tick', steps }), 1000);
    return () => clearInterval(id);
  }, [state.paused, finished, steps]);

  useEffect(() => {
    if (!finished) return;
    setOverlay(null);
    logActivity({ kind: 'workout', minutes: Math.max(1, Math.round(state.elapsed / 60)) });
  }, [finished]);

  if (finished) return null;

  const step = steps[state.index];
  const nextExercise = steps.slice(state.index + 1).find((s) => !s.pause);
  const exercises = steps.filter((s) => !s.pause).length;
  const done = steps.slice(0, state.index + 1).filter((s) => !s.pause).length;

  return (
    <Dialog open fullScreen aria-label={t('workout.label')}>
      <Box
        sx={{
          m: 'auto', width: '100%', maxWidth: 480, display: 'grid', gap: 1.5, textAlign: 'center',
          pt: 'calc(env(safe-area-inset-top) + 16px)',
          pb: 'calc(env(safe-area-inset-bottom) + 16px)',
          pl: 'max(20px, env(safe-area-inset-left))',
          pr: 'max(20px, env(safe-area-inset-right))',
          [LANDSCAPE]: { maxWidth: 800, gap: 0.75 },
          [SHORT]: { gap: 0.75 },
        }}
      >
        <LinearProgress variant="determinate" color="secondary" value={(state.index / steps.length) * 100} sx={{ height: 12, borderRadius: 6 }} />
        <Typography color="text.secondary">
          {t('workout.progress', { round: step.round, rounds, done: Math.max(1, done), total: exercises })}
        </Typography>
        <Box sx={{ display: 'grid', gap: 1.5, [LANDSCAPE]: { gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', columnGap: 3, alignItems: 'center' } }}>
          <Box sx={{ display: 'grid', gap: 1.5, [LANDSCAPE]: { gap: 0.5 } }}>
            <Box aria-hidden sx={{ fontSize: '3.75rem', lineHeight: 1.1, [LANDSCAPE]: { display: 'none' }, [SHORT]: { display: 'none' } }}>{step.emoji}</Box>
            <Typography variant="h1">{t(step.pause ? 'workout.restName' : `exercise.${step.id}.name`)}</Typography>
            <Typography>{t(step.pause ? 'workout.restHow' : `exercise.${step.id}.how`)}</Typography>
            <Box sx={{ position: 'relative', width: 156, height: 156, mx: 'auto', display: 'grid', placeItems: 'center', [LANDSCAPE]: { width: 112, height: 112 }, [SHORT]: { width: 104, height: 104 } }}>
              <CircularProgress
                variant="determinate"
                value={100}
                size="100%"
                thickness={4.5}
                aria-hidden
                sx={{ position: 'absolute', inset: 0, color: 'milo.muted' }}
              />
              <CircularProgress
                variant="determinate"
                value={(state.remaining / step.seconds) * 100}
                size="100%"
                thickness={4.5}
                color={step.pause ? 'secondary' : 'primary'}
                aria-hidden
                sx={{ position: 'absolute', inset: 0, '& circle': { strokeLinecap: 'round' } }}
              />
              <Typography role="timer" data-testid="clock" sx={{ fontSize: '3.25rem', fontWeight: 900, lineHeight: 1, fontVariantNumeric: 'tabular-nums', [LANDSCAPE]: { fontSize: '2.5rem' }, [SHORT]: { fontSize: '2.25rem' } }}>
                {state.remaining}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'grid', gap: 1.25, [LANDSCAPE]: { gap: 0.75 }, [SHORT]: { gap: 0.75 } }}>
            <Typography variant="body2" color="text.secondary">
              {nextExercise ? t('workout.upNext', { name: t(`exercise.${nextExercise.id}.name`) }) : t('workout.last')}
            </Typography>
            <Button variant="contained" color="secondary" onClick={() => dispatch({ type: 'skip', steps })} data-w="skip">
              {t(nextExercise ? 'workout.nextExercise' : 'workout.finish')}
            </Button>
            <Button variant="outlined" onClick={() => dispatch({ type: 'pause' })} data-w="pause">
              {t(state.paused ? 'workout.resume' : 'workout.pause')}
            </Button>
            <Button variant="text" color="error" onClick={() => setOverlay(null)} data-w="stop">{t('workout.stop')}</Button>
          </Box>
        </Box>
        <Typography variant="caption" color="text.secondary">{t('workout.safety')}</Typography>
      </Box>
    </Dialog>
  );
}
