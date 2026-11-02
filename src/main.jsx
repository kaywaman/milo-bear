import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import '@fontsource/nunito/400.css';
import '@fontsource/nunito/700.css';
import '@fontsource/nunito/800.css';
import '@fontsource/nunito/900.css';
import './bear.css';
import './motion.css';
import App from './App.jsx';
import { LanguageProvider } from './components/Language.jsx';
import { MiloProvider } from './store.jsx';
import { theme } from './theme.js';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme} defaultMode="system" noSsr>
      <CssBaseline />
      <LanguageProvider>
        <MiloProvider>
          <App />
        </MiloProvider>
      </LanguageProvider>
    </ThemeProvider>
  </StrictMode>,
);
