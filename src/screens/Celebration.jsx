import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import Bear from '../components/Bear.jsx';
import { useT } from '../components/Language.jsx';
import { BearStage } from '../components/parts.jsx';
import { useMilo } from '../store.jsx';

const CONFETTI = Array.from({ length: 22 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  delay: `${(i % 7) * 0.13}s`,
  color: ['#ff6b35', '#ffc53d', '#2ec4b6', '#d91023', '#7bd651'][i % 5],
}));

export default function Celebration() {
  const t = useT();
  const { celebration, setCelebration } = useMilo();
  if (!celebration) return null;
  const close = () => setCelebration(null);
  return (
    <Dialog open fullScreen onClose={close} slotProps={{ paper: { sx: (t) => ({ background: t.vars.palette.milo.celebrateGradient }) } }}>
      <div className="confetti" aria-hidden>
        {CONFETTI.map((c) => <i key={c.left} style={{ left: c.left, animationDelay: c.delay, background: c.color }} />)}
      </div>
      <Box
        sx={{
          m: 'auto', width: '100%', maxWidth: 480, textAlign: 'center', display: 'grid', gap: 1.5,
          pt: 'calc(env(safe-area-inset-top) + 16px)',
          pb: 'calc(env(safe-area-inset-bottom) + 16px)',
          px: 'max(20px, env(safe-area-inset-left))',
          '@media (orientation: landscape) and (max-height: 500px)': {
            maxWidth: 760, gridTemplateColumns: '220px 1fr', alignItems: 'center', columnGap: 3,
            '& > .stage': { gridRow: 'span 8' },
          },
        }}
      >
        <Box className="stage" sx={{ width: 'min(300px, 76vw, 46dvh)', mx: 'auto' }}>
          <BearStage><Bear key={celebration.title + celebration.emote} emote={celebration.emote} /></BearStage>
        </Box>
        <Typography variant="h1" className="pop-in">{celebration.title}</Typography>
        {celebration.lines.map((line) => <Typography key={line}>{line}</Typography>)}
        <Button variant="contained" autoFocus disableFocusRipple onClick={close} data-close>{t('celebrate.next')}</Button>
      </Box>
    </Dialog>
  );
}
