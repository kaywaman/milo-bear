import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import { useT } from '../components/Language.jsx';
import { TROPHIES } from '../data.js';
import { useMilo } from '../store.jsx';

export default function Trophies() {
  const t = useT();
  const won = useMilo().store.game.trophies;
  return (
    <>
      <Typography variant="h1">{t('trophies.title')}</Typography>
      <Typography color="text.secondary">{t('trophies.won', { won: Object.keys(won).length, total: TROPHIES.length })}</Typography>
      <LinearProgress variant="determinate" color="warning" value={(Object.keys(won).length / TROPHIES.length) * 100} sx={{ height: 10, borderRadius: 5, mt: 1, mb: 2 }} />
      <Box sx={{ display: 'grid', gap: 1.25, gridTemplateColumns: 'repeat(auto-fill, minmax(104px, 1fr))' }}>
        {TROPHIES.map((trophy) => {
          const isWon = Boolean(won[trophy.id]);
          return (
            <Card key={trophy.id} className={isWon ? 'trophy-won' : undefined} sx={{ px: 0.75, py: 1.25, textAlign: 'center', hyphens: 'auto', ...(isWon && { borderColor: 'warning.main', bgcolor: 'milo.goldBackground' }) }}>
              <Box aria-hidden sx={{ fontSize: '2rem', lineHeight: 1.2, ...(!isWon && { filter: 'grayscale(1)', opacity: 0.35 }) }}>{trophy.emoji}</Box>
              <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.84rem', overflowWrap: 'anywhere' }}>{t(`trophy.${trophy.id}.name`)}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.25 }}>{t(`trophy.${trophy.id}.text`)}</Typography>
            </Card>
          );
        })}
      </Box>
    </>
  );
}
