import { createTheme } from '@mui/material/styles';

const light = {
  palette: {
    primary: { main: '#c8430f', dark: '#9d3208', light: '#ffe5d8', contrastText: '#fff' },
    secondary: { main: '#0b7d70', dark: '#075a51', light: '#dcf5f0', contrastText: '#fff' },
    warning: { main: '#f0ad1c', light: '#fff4d6' },
    error: { main: '#c4320a', light: '#ffe9e1' },
    background: { default: '#fff8ef', paper: '#ffffff' },
    text: { primary: '#2b2118', secondary: '#665a50' },
    divider: '#efe3d3',
    milo: {
      primaryGradient: 'linear-gradient(180deg, #d04d1a, #bd3f0b)',
      primaryEdge: '#8f2d07',
      secondaryGradient: 'linear-gradient(180deg, #0c8577, #0a7367)',
      secondaryEdge: '#075a51',
      heroGradient: 'linear-gradient(145deg, #ffd9a8 0%, #ffc6a0 48%, #f9b0a0 100%)',
      celebrateGradient: 'radial-gradient(circle at 50% 35%, #ffe2ac, #fff8ef 72%)',
      glow: 'radial-gradient(circle, rgba(255,255,255,.75) 0%, rgba(255,255,255,0) 68%)',
      cardShadow: '0 1px 2px rgba(92,60,30,.05), 0 6px 18px rgba(92,60,30,.07)',
      noteBorder: '#f5dc9b',
      alertBorder: '#f7c1ad',
      goldBackground: '#fff9e6',
      muted: '#f6ecdf',
    },
  },
};

const dark = {
  palette: {
    primary: { main: '#ff8a55', dark: '#ff7a3d', light: '#47261a', contrastText: '#2a1005' },
    secondary: { main: '#3fd0c0', dark: '#2bb5a6', light: '#123531', contrastText: '#04211d' },
    warning: { main: '#ffc53d', light: '#38290e' },
    error: { main: '#ff9a7a', light: '#401e14' },
    background: { default: '#14100d', paper: '#201a15' },
    text: { primary: '#fbf1e6', secondary: '#c2b4a6' },
    divider: '#372d25',
    milo: {
      primaryGradient: 'linear-gradient(180deg, #ff9a68, #ff7f47)',
      primaryEdge: '#b84c1c',
      secondaryGradient: 'linear-gradient(180deg, #52dccd, #33c4b4)',
      secondaryEdge: '#1b8478',
      heroGradient: 'linear-gradient(145deg, #4a2a1a 0%, #3a2030 55%, #1f2c3f 100%)',
      celebrateGradient: 'radial-gradient(circle at 50% 35%, #553420, #14100d 72%)',
      glow: 'radial-gradient(circle, rgba(255,214,160,.34) 0%, rgba(255,214,160,0) 68%)',
      cardShadow: '0 1px 2px rgba(0,0,0,.3), 0 8px 22px rgba(0,0,0,.28)',
      noteBorder: '#5e4716',
      alertBorder: '#6e3423',
      goldBackground: '#322712',
      muted: '#2b241d',
    },
  },
};

const pressable = (gradient, edge) => ({
  background: gradient,
  boxShadow: `0 4px 0 ${edge}`,
  '&:hover': { background: gradient, boxShadow: `0 4px 0 ${edge}`, filter: 'brightness(1.05)' },
  '&:active': { boxShadow: `0 1px 0 ${edge}`, transform: 'translateY(3px)' },
  '&.Mui-disabled': { background: 'none', boxShadow: 'none' },
});

export const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'data-theme' },
  colorSchemes: { light, dark },
  shape: { borderRadius: 18 },
  typography: {
    fontFamily: '"Nunito", ui-rounded, "SF Pro Rounded", system-ui, sans-serif',
    h1: { fontSize: '1.8rem', fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.01em' },
    h2: { fontSize: '1.15rem', fontWeight: 800, lineHeight: 1.3 },
    button: { fontWeight: 800, textTransform: 'none', fontSize: '1rem' },
  },
  components: {
    MuiCssBaseline: {
      defaultProps: { enableColorScheme: true },
      styleOverrides: {
        html: { WebkitTextSizeAdjust: '100%', height: '100%' },
        body: { minHeight: '100%', WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation', transition: 'background-color .25s' },
        '#root': { minHeight: '100dvh' },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { minHeight: 50, borderRadius: 15, transition: 'transform .06s, box-shadow .06s, filter .15s' },
        containedPrimary: ({ theme: t }) => pressable(t.vars.palette.milo.primaryGradient, t.vars.palette.milo.primaryEdge),
        containedSecondary: ({ theme: t }) => pressable(t.vars.palette.milo.secondaryGradient, t.vars.palette.milo.secondaryEdge),
        outlined: ({ theme: t }) => ({
          borderWidth: 2,
          borderColor: t.vars.palette.divider,
          color: t.vars.palette.text.primary,
          backgroundColor: t.vars.palette.background.paper,
        }),
      },
    },
    MuiDialog: {
      styleOverrides: { paper: ({ theme: t }) => ({ backgroundColor: t.vars.palette.background.default, backgroundImage: 'none' }) },
    },
    MuiCard: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: ({ theme: t }) => ({
          borderWidth: 1.5,
          borderColor: t.vars.palette.divider,
          boxShadow: t.vars.palette.milo.cardShadow,
          backgroundImage: 'none',
        }),
      },
    },
    MuiCardContent: { styleOverrides: { root: { padding: 18, '&:last-child': { paddingBottom: 18 } } } },
    MuiLinearProgress: {
      styleOverrides: {
        root: ({ theme: t }) => ({ backgroundColor: t.vars.palette.milo.muted }),
        bar: { borderRadius: 99 },
      },
    },
  },
});
