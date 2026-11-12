import { Box, Button, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router';
import { LoginForm } from '../components/auth/LoginForm.jsx';
import { LogoutButton } from '../components/auth/LogoutButton.jsx';
import { useAuth } from '../hooks/useAuth.js';

/**
 * /login. ProtectedRoute sends people here with location.state.from, so after logging in they go back
 * to where they wanted (e.g. /catalog) or Home. If someone already has a session they see who they are
 * and can continue or log out (instead of being bounced away).
 */
export default function Login() {
  const { ready, isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const from = location.state?.from;
  // Where they wanted to go; otherwise admins land on the catalog and everyone else on Home.
  const destination_for = (person) => {
    if (from) return `${from.pathname}${from.search ?? ''}`;
    return person?.role === 'admin' ? '/catalog' : '/';
  };
  const go_on = (person = user) => navigate(destination_for(person), { replace: true });

  if (!ready) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'grid', placeItems: 'center', py: { xs: 3, md: 8 } }}>
      <Paper variant="outlined" sx={{ width: '100%', maxWidth: 420, p: { xs: 3, sm: 4 } }}>
        {isAuthenticated ? (
          <Stack spacing={2}>
            <Typography variant="h5" component="h1">You are signed in</Typography>
            <Typography color="text.secondary">
              {user.name} ({user.email})
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={() => go_on(user)}>Continue</Button>
              <LogoutButton to={null} variant="outlined">Log out</LogoutButton>
            </Stack>
          </Stack>
        ) : (
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>Log in</Typography>
              <Typography color="text.secondary">
                {from ? 'Log in to continue to that page.' : 'Log in to your TechCore account.'}
              </Typography>
            </Box>
            <LoginForm onSuccess={(person) => go_on(person)} />
          </Stack>
        )}
      </Paper>
    </Box>
  );
}
