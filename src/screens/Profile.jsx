import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import { LanguageSelect, useLanguage } from '../components/Language.jsx';
import { Section } from '../components/parts.jsx';
import { ModeSelect, useResolvedMode } from '../components/ThemeMode.jsx';
import { DEFAULT_LANGUAGE } from '../i18n.js';
import { GOALS } from '../plan.js';
import { useMilo } from '../store.jsx';

export default function Profile() {
  const { t, setLanguage } = useLanguage();
  const { store, setEditing, resetAll } = useMilo();
  const { profile, game } = store;
  const goal = GOALS[profile.goal];
  const goalLabel = t(`goal.${profile.goal}.label`);
  const [confirm, setConfirm] = useState(false);
  const { setMode } = useResolvedMode();
  const reset = () => {
    setMode('system');
    setLanguage(DEFAULT_LANGUAGE);
    resetAll();
  };
  return (
    <>
      <Typography variant="h1" sx={{ mb: 1.5, overflowWrap: 'anywhere' }}>{profile.nickname}</Typography>
      <Box sx={{ display: 'grid', gap: 1.5, alignItems: 'start', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) minmax(0, 1fr)' } }}>
        <Section>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1, textAlign: 'center' }}>
            {[
              ['🔥', game.streak.best, t('profile.bestStreak')],
              ['💪', game.stats.workouts, t('profile.workouts')],
              ['🌳', game.stats.outdoorMinutes, t('profile.outdoorMinutes')],
            ].map(([icon, value, label]) => (
              <Box key={label}>
                <Box sx={{ fontSize: '1.3rem', fontWeight: 900 }}>{icon} {value}</Box>
                <Typography variant="caption" color="text.secondary">{label}</Typography>
              </Box>
            ))}
          </Box>
        </Section>
        <Section title={t('profile.detailsTitle')}>
          <Typography>{t('profile.details', { age: profile.age, height: t.number(profile.heightCm), weight: t.number(profile.weightKg) })}</Typography>
          <Typography>
            {profile.targetKg
              ? t('profile.goalWeight', { emoji: goal.emoji, goal: goalLabel, kg: t.number(profile.targetKg) })
              : t('profile.goal', { emoji: goal.emoji, goal: goalLabel })}
          </Typography>
          <Button variant="outlined" onClick={() => setEditing(true)} data-edit>{t('profile.edit')}</Button>
        </Section>
        <Section title={t('language.label')}>
          <LanguageSelect />
        </Section>
        <Section title={t('mode.label')}>
          <ModeSelect />
        </Section>
        <Section tone="note">
          <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
            {t('profile.update')} {t('profile.worry')} {t('support')}
          </Typography>
        </Section>
        <Section title={t('profile.privacyTitle')}>
          <Typography variant="body2" color="text.secondary">{t('profile.privacyText')}</Typography>
          <Button variant="outlined" color="error" onClick={() => setConfirm(true)} data-reset sx={{ color: 'error.main' }}>{t('profile.deleteAll')}</Button>
        </Section>
      </Box>
      <Dialog open={confirm} onClose={() => setConfirm(false)}>
        <DialogTitle sx={{ fontWeight: 800 }}>{t('profile.confirmTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('profile.confirmText')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm(false)}>{t('common.cancel')}</Button>
          <Button color="error" onClick={reset} data-reset-confirm>{t('profile.delete')}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
