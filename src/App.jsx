import { useState } from 'react';
import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import CalendarMonthRounded from '@mui/icons-material/CalendarMonthRounded';
import EmojiEventsRounded from '@mui/icons-material/EmojiEventsRounded';
import HomeRounded from '@mui/icons-material/HomeRounded';
import LeaderboardRounded from '@mui/icons-material/LeaderboardRounded';
import PersonRounded from '@mui/icons-material/PersonRounded';
import Celebration from './screens/Celebration.jsx';
import ExercisePicker from './screens/ExercisePicker.jsx';
import Home from './screens/Home.jsx';
import League from './screens/League.jsx';
import LogActivity from './screens/LogActivity.jsx';
import Onboarding from './screens/Onboarding.jsx';
import Plan from './screens/Plan.jsx';
import Profile from './screens/Profile.jsx';
import Trophies from './screens/Trophies.jsx';
import Workout from './screens/Workout.jsx';
import { useT } from './components/Language.jsx';
import { ThemeColorSync } from './components/ThemeMode.jsx';
import { useMilo } from './store.jsx';

const TABS = [
  { id: 'home', icon: <HomeRounded />, Screen: Home },
  { id: 'plan', icon: <CalendarMonthRounded />, Screen: Plan },
  { id: 'liga', icon: <LeaderboardRounded />, Screen: League },
  { id: 'pokale', icon: <EmojiEventsRounded />, Screen: Trophies },
  { id: 'profil', icon: <PersonRounded />, Screen: Profile },
];

const RAIL_WIDTH = 220;
const NAV_ACTION = {
  minWidth: 0,
  px: 0,
  color: 'text.secondary',
  '& .MuiSvgIcon-root': { width: 52, height: 30, px: 1.75, py: 0.4, borderRadius: 99, boxSizing: 'border-box', transition: 'background-color .2s' },
  '&.Mui-selected': { color: 'primary.main' },
  '&.Mui-selected .MuiSvgIcon-root': { bgcolor: 'primary.light' },
  '& .MuiBottomNavigationAction-label, & .MuiBottomNavigationAction-label.Mui-selected': { fontSize: '.74rem', fontWeight: 800 },
};
const NAV_HEIGHT = 64;

function SideNav({ tab, onChange }) {
  const t = useT();
  return (
    <Paper
      component="nav"
      aria-label={t('app.mainMenu')}
      square
      variant="outlined"
      sx={{ position: 'fixed', inset: '0 auto 0 0', width: RAIL_WIDTH, borderWidth: '0 1.5px 0 0', p: 2, boxShadow: 'none' }}
    >
      <Typography sx={{ fontWeight: 900, fontSize: '1.5rem', color: 'primary.main', px: 1.5, pb: 2 }}>🐻 Milo</Typography>
      <List disablePadding sx={{ display: 'grid', gap: 0.5 }}>
        {TABS.map((item) => (
          <ListItemButton
            key={item.id}
            selected={item.id === tab}
            aria-current={item.id === tab ? 'page' : undefined}
            data-tab={item.id}
            onClick={() => onChange(item.id)}
            sx={{ borderRadius: 2, '&.Mui-selected': { bgcolor: 'primary.light' }, '&.Mui-selected:hover': { bgcolor: 'primary.light' } }}
          >
            <ListItemIcon sx={{ minWidth: 38, color: item.id === tab ? 'primary.main' : 'text.secondary' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={t(`nav.${item.id}`)} slotProps={{ primary: { sx: { fontWeight: 800 } } }} />
          </ListItemButton>
        ))}
      </List>
    </Paper>
  );
}

function BottomNav({ tab, onChange }) {
  const t = useT();
  return (
    <Paper
      component="nav"
      aria-label={t('app.mainMenu')}
      square
      variant="outlined"
      sx={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 'appBar', borderWidth: '1.5px 0 0', boxShadow: 'none',
        pb: 'env(safe-area-inset-bottom)', pl: 'env(safe-area-inset-left)', pr: 'env(safe-area-inset-right)',
      }}
    >
      <BottomNavigation showLabels value={tab} onChange={(_, id) => onChange(id)} sx={{ height: NAV_HEIGHT, background: 'none' }}>
        {TABS.map((item) => (
          <BottomNavigationAction key={item.id} value={item.id} label={t(`nav.${item.id}`)} icon={item.icon} data-tab={item.id} sx={NAV_ACTION} />
        ))}
      </BottomNavigation>
    </Paper>
  );
}

export default function App() {
  const {
    store, editing, overlay, toast, setToast,
  } = useMilo();
  const [tab, setTab] = useState('home');
  const theme = useTheme();
  const wide = useMediaQuery(theme.breakpoints.up('md'), { noSsr: true });

  const changeTab = (id) => {
    setTab(id);
    window.scrollTo(0, 0);
  };

  if (!store.profile || editing) return <><ThemeColorSync /><Onboarding /></>;

  const { Screen } = TABS.find((item) => item.id === tab);
  return (
    <>
      <ThemeColorSync />
      {wide ? <SideNav tab={tab} onChange={changeTab} /> : <BottomNav tab={tab} onChange={changeTab} />}
      <Box
        component="main"
        sx={{
          ml: { md: `${RAIL_WIDTH}px` },
          pt: 'calc(env(safe-area-inset-top) + 12px)',
          pb: { xs: `calc(${NAV_HEIGHT + 24}px + env(safe-area-inset-bottom))`, md: 4 },
          pl: 'max(16px, env(safe-area-inset-left))',
          pr: 'max(16px, env(safe-area-inset-right))',
        }}
      >
        <Box key={tab} className="page-in" sx={{ maxWidth: { xs: 600, md: 1040 }, mx: 'auto', mt: { md: 2 } }}>
          <Screen />
        </Box>
      </Box>
      {overlay?.kind === 'picker' && <ExercisePicker type={overlay.type} />}
      {overlay?.kind === 'workout' && <Workout workout={overlay.workout} />}
      {overlay?.kind === 'log' && <LogActivity />}
      <Celebration />
      <Snackbar
        key={toast?.key}
        open={Boolean(toast)}
        message={toast?.text}
        autoHideDuration={2600}
        onClose={() => setToast(null)}
        sx={{ bottom: { xs: `calc(${NAV_HEIGHT + 16}px + env(safe-area-inset-bottom))`, md: 24 } }}
      />
    </>
  );
}
