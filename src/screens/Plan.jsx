import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useT } from '../components/Language.jsx';
import {
  PrognosisCard, Section, WeekList, parseNumber,
} from '../components/parts.jsx';
import { addDays, parseKey } from '../game.js';
import { WEIGH_IN_DAYS } from '../health.js';
import { GOALS } from '../plan.js';
import { today, useMilo } from '../store.jsx';

function WeightCard() {
  const t = useT();
  const { store, weighIn, setEditing } = useMilo();
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  if (!GOALS[store.profile.goal].weight) return null;

  if (store.goalPaused) {
    return (
      <Section tone="alert" title={t('plan.pausedTitle')}>
        <Typography sx={{ overflowWrap: 'anywhere' }}>{t('plan.pausedText')} {t('support')}</Typography>
        <Button variant="outlined" onClick={() => setEditing(true)}>{t('plan.changeGoal')}</Button>
      </Section>
    );
  }

  const last = store.weights?.at(-1);
  const next = last ? addDays(last.day, WEIGH_IN_DAYS) : today();
  const save = () => {
    const kg = parseNumber(value);
    if (!(kg >= 25 && kg <= 200)) {
      setError(t('common.weightError'));
      return;
    }
    setError('');
    setValue('');
    weighIn(kg);
  };

  return (
    <Section title={t('plan.checkInTitle')}>
      <Typography variant="body2" color="text.secondary">
        {t('plan.checkInText')}
      </Typography>
      {next <= today() ? (
        <>
          <TextField
            label={t('plan.yourWeight')}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            error={Boolean(error)}
            helperText={error}
            slotProps={{ htmlInput: { inputMode: 'decimal', id: 'weighIn' } }}
          />
          <Button variant="contained" color="secondary" onClick={save} data-weigh>{t('plan.enter')}</Button>
        </>
      ) : (
        <Typography>
          {t('plan.nextCheckIn', { date: t.date(parseKey(next), { weekday: 'long', day: 'numeric', month: 'long' }) })}
        </Typography>
      )}
    </Section>
  );
}

export default function Plan() {
  const t = useT();
  const { store } = useMilo();
  const { plan, profile, goalPaused } = store;
  return (
    <>
      <Typography variant="h1" sx={{ mb: 1.5 }}>{t('plan.title')}</Typography>
      <Box sx={{ display: 'grid', gap: 1.5, alignItems: 'start', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) minmax(0, 1fr)' } }}>
        <Box sx={{ display: 'grid', gap: 1.5, minWidth: 0 }}>
          {!goalPaused && <PrognosisCard plan={plan} profile={profile} />}
          <WeightCard />
        </Box>
        <Box sx={{ display: 'grid', gap: 1.5, minWidth: 0 }}>
          <Section title={t('week.title')}><WeekList plan={plan} /></Section>
          <Section tone="note">
            <Typography variant="body2">
              {t(profile.age < 18 ? 'plan.whoTeen' : 'plan.whoAdult')}{' '}
              {t('plan.whoNote')}
            </Typography>
          </Section>
        </Box>
      </Box>
    </>
  );
}
