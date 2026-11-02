// Kleine gemeinsame Bausteine für mehrere Screens.
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { GOALS, targetDate, SESSION_TYPES, dayIndex } from '../plan.js';
import { useT } from './Language.jsx';

// Komma und Punkt gelten in jeder Sprache, viele Tastaturen bieten nur eines von beiden an.
export const parseNumber = (value) => Number(String(value).replace(',', '.'));

// Sanftes Leuchten hinter Milo, in beiden Modi gut sichtbar.
export function BearStage({ children, sx }) {
  return (
    <Box
      sx={[(t) => ({
        position: 'relative',
        '&::before': { content: '""', position: 'absolute', inset: '-6%', borderRadius: '50%', background: t.vars.palette.milo.glow },
        '& > svg': { position: 'relative' },
      }), sx]}
    >
      {children}
    </Box>
  );
}

export function Section({ title, children, tone, ...rest }) {
  const tones = {
    note: { bgcolor: 'warning.light', borderColor: 'milo.noteBorder' },
    alert: { bgcolor: 'error.light', borderColor: 'milo.alertBorder' },
  };
  return (
    <Card sx={tones[tone]} {...rest}>
      <CardContent sx={{ display: 'grid', gap: 1.25 }}>
        {title && <Typography variant="h2">{title}</Typography>}
        {children}
      </CardContent>
    </Card>
  );
}

export function Choice({ selected, onClick, title, text, center, ...rest }) {
  return (
    <Card sx={{ borderColor: selected ? 'secondary.main' : 'divider', bgcolor: selected ? 'secondary.light' : 'background.paper' }}>
      <CardActionArea aria-pressed={selected} onClick={onClick} sx={{ p: 1.5, px: center ? 0.5 : 1.5, minHeight: 50, textAlign: center ? 'center' : 'left' }} {...rest}>
        <Typography sx={{ fontWeight: selected ? 800 : 700 }}>{title}</Typography>
        {text && <Typography variant="body2" color="text.secondary">{text}</Typography>}
      </CardActionArea>
    </Card>
  );
}

const monthLabel = (t, weeks, startKey) => t.date(targetDate(startKey, weeks), { month: 'long', year: 'numeric' });

// Wird beim Anzeigen aus dem Profil gebildet, damit der Plan im Spielstand keine Sprache festschreibt.
export function goalTarget(t, profile) {
  if (GOALS[profile.goal].weight) return t('target.weight', { kg: t.number(profile.targetKg) });
  return t(`target.${profile.goal}.${profile.level}`);
}

export function PrognosisCard({ plan, profile }) {
  const t = useT();
  const { weeksMin, weeksMax, rateKgPerWeek } = plan.prognosis;
  return (
    <Section title={t('prognosis.title', { target: goalTarget(t, profile) })} data-testid="prognosis">
      <Typography sx={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1.1, color: 'primary.main' }}>
        {t('prognosis.weeks', { min: weeksMin, max: weeksMax })}
      </Typography>
      <Typography>{t('prognosis.until', { from: monthLabel(t, weeksMin, plan.startKey), to: monthLabel(t, weeksMax, plan.startKey) })}</Typography>
      {rateKgPerWeek && (
        <Typography variant="body2" color="text.secondary">
          {t('prognosis.rate', { kg: t.number(rateKgPerWeek) })}{' '}
          {t(profile.age < 18 ? 'prognosis.slowTeen' : 'prognosis.slowAdult')}
        </Typography>
      )}
      <Typography variant="body2" color="text.secondary">{t('prognosis.estimate')}</Typography>
    </Section>
  );
}

export function WeekList({ plan }) {
  const t = useT();
  const now = dayIndex(new Date());
  return (
    <Box sx={{ display: 'grid', gap: 0.75 }}>
      {plan.week.map((type, i) => {
        const session = SESSION_TYPES[type];
        return (
          <Box
            key={t(`days.${i}`)}
            sx={{
              display: 'flex', gap: 1.25, px: 1.25, py: 1, borderRadius: 1.5,
              bgcolor: i === now ? 'primary.light' : 'milo.muted',
              fontWeight: i === now ? 800 : 400,
            }}
          >
            <Box component="b" sx={{ width: 38, flex: 'none' }}>{t(`days.${i}`)}</Box>
            <span>{session.emoji} {t(`session.${type}`)}{type === 'rest' ? '' : ` · ${t('week.minutes', { minutes: plan.sessionMinutes })}`}</span>
          </Box>
        );
      })}
    </Box>
  );
}
