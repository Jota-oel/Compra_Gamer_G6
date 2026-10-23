import { Link as RouterLink, Outlet } from 'react-router';
import { Box, Button, Container, Stack } from '@mui/material';
import { useAuth } from '../hooks/useAuth.js';
import { useCart } from '../hooks/useCart.js';

/**
 * PLACEHOLDER shell so the routes can be navigated. Dev A replaces it with the real
 * MainLayout (Navbar, Footer, cart dialog state). Keep <Outlet /> as the page slot.
 */
export function MainLayout() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { count } = useCart();

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Button component={RouterLink} to="/">Home</Button>
          {isAdmin && <Button component={RouterLink} to="/catalog">Catalog</Button>}
          <Box sx={{ flexGrow: 1 }} />
          <span>Cart: {count}</span>
          {isAuthenticated ? (
            <Button onClick={logout}>Logout ({user.name})</Button>
          ) : (
            <Button component={RouterLink} to="/login">Login</Button>
          )}
        </Stack>
      </Container>
      <Container maxWidth="lg" sx={{ pb: 6 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
