import { createTheme } from '@mui/material/styles';

/**
 * SKELETON by the platform owner. Dev A owns this file from now on (palette, typography, overrides).
 * Brand colours come from the original colores.css: cyan + pink on a dark background.
 */
export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#00e5ff' },
    secondary: { main: '#ff0a6c' },
    background: { default: '#07090f', paper: '#0d1220' },
  },
});
