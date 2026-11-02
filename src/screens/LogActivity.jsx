import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useT } from '../components/Language.jsx';
import { Choice, parseNumber } from '../components/parts.jsx';
import { OUTDOOR } from '../data.js';
import { useMilo } from '../store.jsx';

export default function LogActivity() {
  const t = useT();
  const { setOverlay, logActivity } = useMilo();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'), { noSsr: true });
  const [kind, setKind] = useState('');
  const [name, setName] = useState('');
  const [minutes, setMinutes] = useState('30');
  const [error, setError] = useState('');

  const save = () => {
    const value = parseNumber(minutes);
    if (!kind) return setError(t('log.errorKind'));
    if (!Number.isInteger(value) || value < 5 || value > 240) return setError(t('log.errorMinutes'));
    if (kind === 'sport' && !name.trim()) return setError(t('log.errorSport'));
    setOverlay(null);
    logActivity(kind === 'sport'
      ? { kind: 'sport', minutes: value, name: name.trim() }
      : { kind: 'outdoor', minutes: value, name: kind });
    return undefined;
  };

  return (
    <Dialog open fullScreen={fullScreen} maxWidth="xs" fullWidth onClose={() => setOverlay(null)} aria-label={t('log.title')}>
      <Box sx={{
        m: 'auto', width: '100%', maxWidth: 480, display: 'grid', gap: 1.5,
        pt: 'calc(env(safe-area-inset-top) + 16px)', pb: 'calc(env(safe-area-inset-bottom) + 16px)',
        pl: 'max(20px, env(safe-area-inset-left))', pr: 'max(20px, env(safe-area-inset-right))',
      }}
      >
        <Typography variant="h1">{t('log.title')}</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
          {OUTDOOR.map((o) => (
            <Choice key={o.id} center title={`${o.emoji} ${t(`outdoor.${o.id}`)}`} selected={kind === o.id} onClick={() => setKind(o.id)} data-kind={o.id} />
          ))}
          <Box sx={{ gridColumn: '1 / -1' }}>
            <Choice center title={t('log.ownSport')} selected={kind === 'sport'} onClick={() => setKind('sport')} data-kind="sport" />
          </Box>
        </Box>
        {kind === 'sport' && (
          <TextField
            label={t('log.whichSport')}
            placeholder={t('log.sportExample')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            slotProps={{ htmlInput: { maxLength: 30, id: 'sportName' } }}
          />
        )}
        <TextField
          label={t('log.minutes')}
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          slotProps={{ htmlInput: { inputMode: 'numeric', id: 'logMinutes' } }}
        />
        {error && <Typography color="error" role="alert" sx={{ fontWeight: 700 }}>{error}</Typography>}
        <Button variant="contained" color="secondary" onClick={save} data-logsave>{t('common.save')}</Button>
        <Button variant="outlined" onClick={() => setOverlay(null)}>{t('common.cancel')}</Button>
      </Box>
    </Dialog>
  );
}
