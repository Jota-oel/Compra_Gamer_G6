import { useNavigate } from 'react-router';
import { Button } from '@mui/material';
import { useAuth } from '../../hooks/useAuth.js';

/**
 * Drop-in logout. useAuth().logout() clears the user immediately (the server session closes in the
 * background), so we can navigate right away. `to={null}` stays on the current page.
 *   <LogoutButton />                    -> logs out and goes Home
 *   <LogoutButton to={null} variant="outlined" />
 * Any other prop goes to the MUI Button. Maxi can use it in the Navbar user menu.
 */
export function LogoutButton({ to = '/', children = 'Log out', ...button_props }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handle_click = () => {
    logout();
    if (to) navigate(to);
  };

  return <Button onClick={handle_click} {...button_props}>{children}</Button>;
}

export default LogoutButton;
