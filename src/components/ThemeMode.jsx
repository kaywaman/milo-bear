// Hell, dunkel oder wie am Gerät eingestellt. MUI speichert die Wahl selbst im localStorage.
import { useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import { useColorScheme } from '@mui/material/styles';
import DarkModeRounded from '@mui/icons-material/DarkModeRounded';
import LightModeRounded from '@mui/icons-material/LightModeRounded';
import PhoneIphoneRounded from '@mui/icons-material/PhoneIphoneRounded';
import { useT } from './Language.jsx';

const BAR_COLORS = { light: '#fff8ef', dark: '#14100d' };

export function useResolvedMode() {
  const { mode, systemMode, setMode } = useColorScheme();
  return { mode, setMode, resolved: mode === 'system' ? systemMode : mode };
}

// Färbt die Browser-Leiste passend zum Modus ein.
export function ThemeColorSync() {
  const { resolved } = useResolvedMode();
  useEffect(() => {
    if (resolved) document.querySelector('meta[name="theme-color"]')?.setAttribute('content', BAR_COLORS[resolved]);
  }, [resolved]);
  return null;
}

export function ModeToggle() {
  const t = useT();
  const { resolved, setMode } = useResolvedMode();
  const dark = resolved === 'dark';
  const label = t(dark ? 'mode.toLight' : 'mode.toDark');
  return (
    <Tooltip title={label}>
      <IconButton
        aria-label={label}
        data-mode-toggle
        onClick={() => setMode(dark ? 'light' : 'dark')}
        sx={{ width: 44, height: 44, bgcolor: 'background.paper', border: 1.5, borderColor: 'divider' }}
      >
        {dark ? <LightModeRounded /> : <DarkModeRounded />}
      </IconButton>
    </Tooltip>
  );
}

export function ModeSelect() {
  const t = useT();
  const { mode, setMode } = useResolvedMode();
  const options = [
    { value: 'system', label: t('mode.system'), icon: <PhoneIphoneRounded fontSize="small" /> },
    { value: 'light', label: t('mode.light'), icon: <LightModeRounded fontSize="small" /> },
    { value: 'dark', label: t('mode.dark'), icon: <DarkModeRounded fontSize="small" /> },
  ];
  return (
    <ToggleButtonGroup
      exclusive
      fullWidth
      color="secondary"
      aria-label={t('mode.label')}
      value={mode ?? 'system'}
      onChange={(_, value) => value && setMode(value)}
    >
      {options.map((o) => (
        <ToggleButton key={o.value} value={o.value} data-mode={o.value} sx={{ gap: 0.75, minHeight: 48, textTransform: 'none', fontWeight: 800, '@media (max-width: 359px)': { flexDirection: 'column', gap: 0, px: 0.5 } }}>
          {o.icon}{o.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
