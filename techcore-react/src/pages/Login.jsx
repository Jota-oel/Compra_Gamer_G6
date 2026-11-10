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

  // already logged in (or just logged in): go where the user wanted to go, or Home
  if (isAuthenticated) return <Navigate to={location.state?.from?.pathname ?? '/'} replace />;

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
    <Stack component="form" onSubmit={handle_submit} spacing={2} sx={{ maxWidth: 360 }}>
      <Typography variant="h4">Login (placeholder)</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
      <TextField label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
      <Button type="submit" variant="contained" disabled={loading}>Sign in</Button>
    </Stack>
  );
}
