import { useState } from 'react';
import { Alert, Button, CircularProgress, IconButton, InputAdornment, Stack, TextField } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../../hooks/useAuth.js';

/**
 * Contract: { onSuccess }. Calls useAuth().login and shows the error (invalid credentials or network)
 * inside the form. It does NOT navigate: the page decides where to go in onSuccess(user).
 */
export function LoginForm({ onSuccess }) {
  const { login, loading } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [show_password, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const set_field = (name) => (event) => {
    setForm((current) => ({ ...current, [name]: event.target.value }));
    setError(''); // the message disappears as soon as the person edits a field
  };

  const handle_submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const user = await login({ email: form.email.trim().toLowerCase(), password: form.password });
      onSuccess?.(user);
    } catch (failure) {
      setError(failure.message); // 'Invalid email or password' or "Cannot reach the API..."
      setForm((current) => ({ ...current, password: '' }));
    }
  };

  return (
    <Stack component="form" onSubmit={handle_submit} spacing={2}>
      {error && <Alert severity="error">{error}</Alert>}

      <TextField
        label="Email"
        type="email"
        value={form.email}
        onChange={set_field('email')}
        autoComplete="email"
        autoFocus
        required
        disabled={loading}
      />

      <TextField
        label="Password"
        type={show_password ? 'text' : 'password'}
        value={form.password}
        onChange={set_field('password')}
        autoComplete="current-password"
        required
        disabled={loading}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  edge="end"
                  aria-label={show_password ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((current) => !current)}
                  onMouseDown={(event) => event.preventDefault()}
                >
                  {show_password ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={loading}
        startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
      >
        {loading ? 'Signing in…' : 'Log in'}
      </Button>
    </Stack>
  );
}

export default LoginForm;
