import { useState } from 'react';
import { Navigate, useLocation } from 'react-router';
import { Alert, Button, Stack, TextField, Typography } from '@mui/material';
import { useAuth } from '../hooks/useAuth.js';

/** PLACEHOLDER but functional. Dev C replaces it with LoginForm (components/auth) + real styling. */
export default function Login() {
  const { isAuthenticated, loading, login } = useAuth();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const from = location.state?.from;
  // Where they wanted to go; otherwise admins land on the catalog and everyone else on Home.
  const destination_for = (person) => {
    if (from) return `${from.pathname}${from.search ?? ''}`;
    return person?.role === 'admin' ? '/catalog' : '/';
  };
  const go_on = (person = user) => navigate(destination_for(person), { replace: true });

  const handle_submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await login(form); // the redirect above happens on the next render
    } catch (failure) {
      setError(failure.message);
    }
  };

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
