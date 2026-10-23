import { BrowserRouter } from 'react-router';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from '../theme/theme.js';
import { NotificationProvider } from './NotificationProvider.jsx';
import { AuthProvider } from './AuthProvider.jsx';
import { ComponentsProvider } from './ComponentsProvider.jsx';
import { ComputersProvider } from './ComputersProvider.jsx';
import { CartProvider } from './CartProvider.jsx';

/**
 * Order matters (each one may use the ones above it):
 * Theme > Notification > Auth > Components > Computers > Cart > Router
 */
export function AppProviders({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationProvider>
        <AuthProvider>
          <ComponentsProvider>
            <ComputersProvider>
              <CartProvider>
                <BrowserRouter>{children}</BrowserRouter>
              </CartProvider>
            </ComputersProvider>
          </ComponentsProvider>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}
