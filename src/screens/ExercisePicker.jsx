// Vor Cardio und Ganzkörper: Eigene Übungen wählen oder eine Vorauswahl übernehmen.
import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import CloseRounded from '@mui/icons-material/CloseRounded';
import { useT } from '../components/Language.jsx';
import {
  MAX_PICKS, MIN_PICKS, SESSION_TYPES, buildWorkout, defaultPicks, exercisePool, quietPicks, randomPicks,
} from '../plan.js';
import { useMilo } from '../store.jsx';

const sameSet = (a, b) => a.length === b.length && a.every((id) => b.includes(id));

export default function ExercisePicker({ type }) {
  const t = useT();
  const {
    store, setOverlay, savePicks,
  } = useMilo();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'), { noSsr: true });
  const pool = exercisePool(type);
  const [picks, setPicks] = useState(() => {
    const saved = store.picks?.[type]?.filter((id) => pool.some((e) => e.id === id));
    return saved?.length >= MIN_PICKS ? saved : defaultPicks(type);
  });
  const workout = useMemo(() => buildWorkout(type, store.profile.level, picks), [type, store.profile.level, picks]);
  const enough = picks.length >= MIN_PICKS;
  const full = picks.length >= MAX_PICKS;

  const toggle = (id) => setPicks((current) => (
    current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
  ));
  const start = () => {
    savePicks(type, picks);
    setOverlay({ kind: 'workout', workout });
  };

  const presets = [
    { label: t('picker.recommended'), ids: defaultPicks(type) },
    { label: t('picker.quiet'), ids: quietPicks(type) },
  ];

  return (
    <Dialog open fullScreen={fullScreen} maxWidth="md" fullWidth onClose={() => setOverlay(null)} aria-labelledby="picker-title">
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1, height: { xs: '100%', sm: '80dvh' } }}>
        <Box sx={{
          pt: 'calc(env(safe-area-inset-top) + 12px)', pb: 1,
          pl: 'max(16px, env(safe-area-inset-left))', pr: 'max(16px, env(safe-area-inset-right))',
        }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography id="picker-title" variant="h1" sx={{ flex: 1, fontSize: '1.5rem' }}>
              {SESSION_TYPES[type].emoji} {t(`picker.title.${type}`)}
            </Typography>
            <IconButton aria-label={t('common.close')} onClick={() => setOverlay(null)} sx={{ width: 44, height: 44 }}><CloseRounded /></IconButton>
          </Box>
          <Typography color="text.secondary">{t('picker.intro', { min: MIN_PICKS, max: MAX_PICKS })}</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.25 }}>
            {presets.map((p) => (
              <Chip
                key={p.label}
                label={p.label}
                clickable
                color={sameSet(picks, p.ids) ? 'secondary' : 'default'}
                variant={sameSet(picks, p.ids) ? 'filled' : 'outlined'}
                onClick={() => setPicks(p.ids)}
                sx={{ height: 40, fontWeight: 700 }}
              />
            ))}
            <Chip label={t('picker.surprise')} clickable variant="outlined" onClick={() => setPicks(randomPicks(type))} sx={{ height: 40, fontWeight: 700 }} />
          </Box>
        </Box>

        <Box sx={{
          flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch', py: 1,
          pl: 'max(16px, env(safe-area-inset-left))', pr: 'max(16px, env(safe-area-inset-right))',
          display: 'grid', gap: 1, alignContent: 'start', gridAutoRows: 'max-content', gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' },
        }}
        >
          {pool.map((e) => {
            const selected = picks.includes(e.id);
            const locked = full && !selected;
            return (
              <Card key={e.id} sx={{ borderColor: selected ? 'secondary.main' : 'divider', bgcolor: selected ? 'secondary.light' : 'background.paper', opacity: locked ? 0.55 : 1 }}>
                <CardActionArea
                  disabled={locked}
                  aria-pressed={selected}
                  data-exercise={e.id}
                  onClick={() => toggle(e.id)}
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.25, height: '100%', justifyContent: 'flex-start' }}
                >
                  <Box aria-hidden sx={{ fontSize: '1.7rem', lineHeight: 1, width: 36, textAlign: 'center', flex: 'none' }}>{e.emoji}</Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 800 }}>
                      {t(`exercise.${e.id}.name`)}{e.quiet && <Typography component="span" variant="caption" color="text.secondary">{t('picker.quietTag')}</Typography>}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">{t(`exercise.${e.id}.how`)}</Typography>
                  </Box>
                  <Checkbox checked={selected} color="secondary" tabIndex={-1} disableRipple slotProps={{ input: { 'aria-hidden': true } }} sx={{ pointerEvents: 'none', p: 0.5 }} />
                </CardActionArea>
              </Card>
            );
          })}
        </Box>

        <Box sx={{
          borderTop: 2, borderColor: 'divider', bgcolor: 'background.paper', pt: 1.25,
          pb: 'calc(env(safe-area-inset-bottom) + 12px)',
          pl: 'max(16px, env(safe-area-inset-left))', pr: 'max(16px, env(safe-area-inset-right))',
        }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 1 }} data-testid="picker-summary">
            {enough
              ? t('picker.summary', {
                exercises: t('picker.exercises', { count: picks.length }),
                rounds: t('picker.rounds', { count: workout.rounds }),
                minutes: workout.minutes,
              })
              : t('picker.remaining', { count: MIN_PICKS - picks.length })}
          </Typography>
          <Button variant="contained" fullWidth disabled={!enough} onClick={start} data-start>{t('common.startWorkout')}</Button>
        </Box>
      </Box>
    </Dialog>
  );
}
