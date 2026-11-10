import { createTheme } from '@mui/material/styles';

/**
 * Tema oscuro de TechCore (MX-1). Dueño: Maxi.
 * Los colores salen de pages/css/colores.css del proyecto original: cian + rosa sobre fondo oscuro.
 *   primary   = cian  (--cian)  -> office / acciones
 *   secondary = rosa  (--rosa)  -> gaming / acentos
 *   divider   = --borde, text.secondary = --texto-secundario
 *   background.alt = --superficie-secundaria (botones, imágenes, placeholders)
 */
const BRAND = {
  cyan: '#00F0FF',
  pink: '#FF007F',
  bg: '#07080E',
  surface: '#0D0F1A',
  surface_alt: '#12182F',
  border: '#1E2235',
  border_light: '#2E344F',
  text_secondary: '#8E9AA8',
  text_muted: '#64748B',
  green: '#10B981',
  red: '#EF4444',
  orange: '#F59E0B',
  blue: '#3B82F6',
};

/** Alto de la barra de navegación: lo usa el scroll a secciones (#gaming, #office). */
export const NAVBAR_HEIGHT = 72;

/** Color de acento (clave de la paleta) de cada tipo de computer: gaming = rosa, office = cian. */
export function accent_for_type(type) {
  return type === 'gaming' ? 'secondary' : 'primary';
}

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: BRAND.cyan, contrastText: BRAND.bg },
    secondary: { main: BRAND.pink, contrastText: '#FFFFFF' },
    success: { main: BRAND.green },
    error: { main: BRAND.red },
    warning: { main: BRAND.orange },
    info: { main: BRAND.blue },
    background: { default: BRAND.bg, paper: BRAND.surface, alt: BRAND.surface_alt },
    text: { primary: '#FFFFFF', secondary: BRAND.text_secondary, disabled: BRAND.text_muted },
    divider: BRAND.border,
    border: { main: BRAND.border, light: BRAND.border_light },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: '"Segoe UI", Roboto, Arial, sans-serif',
    h1: { fontWeight: 700, lineHeight: 1.2 },
    h2: { fontWeight: 700, lineHeight: 1.15 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { fontWeight: 700, textTransform: 'none', letterSpacing: 0 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          // los links #gaming / #office no quedan tapados por la barra fija
          scrollPaddingTop: NAVBAR_HEIGHT,
          '@media (prefers-reduced-motion: no-preference)': { scrollBehavior: 'smooth' },
        },
        body: { colorScheme: 'dark' },
        'img, svg': { maxWidth: '100%' },
        // mismo foco visible que el proyecto original
        ':focus-visible': { outline: `2px solid ${BRAND.cyan}`, outlineOffset: 2 },
        '@media (prefers-reduced-motion: reduce)': {
          '*, *::before, *::after': { transition: 'none !important', animation: 'none !important' },
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: 'default' },
      styleOverrides: {
        root: {
          backgroundColor: BRAND.surface,
          backgroundImage: 'none',
          borderBottom: `1px solid ${BRAND.border}`,
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { backgroundImage: 'none', border: `1px solid ${BRAND.border}` },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { backgroundColor: BRAND.surface, border: `1px solid ${BRAND.border}` },
      },
    },
    MuiLink: {
      defaultProps: { underline: 'none' },
    },
    MuiBadge: {
      styleOverrides: { badge: { fontWeight: 700 } },
    },
  },
});
