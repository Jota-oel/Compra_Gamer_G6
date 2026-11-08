import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router';
import {
  AppBar, Badge, Box, Button, Divider, IconButton, ListItemIcon, Menu, MenuItem, Toolbar, Typography,
} from '@mui/material';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../hooks/useAuth.js';
import { useCart } from '../hooks/useCart.js';
import { useNotify } from '../hooks/useNotify.js';
import logo_icon from '../assets/logo-logo.png';
import logo_name from '../assets/logo-nombre.png';
import { NAVBAR_HEIGHT } from '../theme/theme.js';

// Los links de la Home llevan a las secciones (ids definidos en ShowcaseSection).
const SECTION_LINKS = [
  { label: 'Gaming Series', to: { pathname: '/', hash: '#gaming' } },
  { label: 'Office', to: { pathname: '/', hash: '#office' } },
];

/**
 * Barra de navegación (MX-1). Dueño: Maxi.
 * Logo, links a las secciones, badge del carrito (useCart().count) y Login o menú del usuario.
 * Props: onCartClick() -> el layout abre el carrito.
 */
export function Navbar({ onCartClick }) {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { count } = useCart();
  const { notify } = useNotify();
  const navigate = useNavigate();
  const [menu_anchor, setMenuAnchor] = useState(null);

  const close_menu = () => setMenuAnchor(null);

  const handle_logout = async () => {
    close_menu();
    await logout(); // el usuario queda deslogueado al instante; si falla el servidor, avisa el provider
    notify('Signed out', 'info');
    navigate('/');
  };

  return (
    <AppBar position="sticky">
      <Toolbar
        sx={{
          maxWidth: 1440,
          width: '100%',
          mx: 'auto',
          minHeight: NAVBAR_HEIGHT,
          px: { xs: 2, md: 3 },
          py: { xs: 1, md: 0 },
          gap: { xs: 1.5, md: 3 },
          flexWrap: 'wrap', // en móvil los links bajan a una segunda fila
          justifyContent: 'space-between',
        }}
      >
        <Box
          component={RouterLink}
          to="/"
          aria-label="TechCore home"
          sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5 }}
        >
          <Box component="img" src={logo_icon} alt="" width={32} height={32} sx={{ objectFit: 'contain' }} />
          <Box
            component="img"
            src={logo_name}
            alt="TechCore"
            sx={{ width: { xs: 120, sm: 173 }, height: 'auto', objectFit: 'contain' }}
          />
        </Box>

        <Box
          component="nav"
          aria-label="Sections"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: { xs: 'center', md: 'flex-start' },
            gap: { xs: 2.5, md: 1 },
            order: { xs: 3, md: 0 },
            width: { xs: '100%', md: 'auto' },
            flexGrow: { md: 1 },
            ml: { md: 3 },
          }}
        >
          {SECTION_LINKS.map((link) => (
            <Button
              key={link.label}
              component={RouterLink}
              to={link.to}
              color="inherit"
              size="small"
              sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: 'transparent' } }}
            >
              {link.label}
            </Button>
          ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
          <IconButton onClick={onCartClick} aria-label={`Open cart (${count} items)`} color="inherit">
            <Badge badgeContent={count} color="secondary" max={99} showZero={false}>
              <ShoppingCartOutlinedIcon />
            </Badge>
          </IconButton>

          {isAuthenticated ? (
            <>
              <Button
                color="primary"
                variant="outlined"
                size="small"
                startIcon={<AccountCircleOutlinedIcon />}
                onClick={(event) => setMenuAnchor(event.currentTarget)}
                aria-haspopup="menu"
                aria-expanded={Boolean(menu_anchor)}
                aria-controls="user-menu"
                sx={{ maxWidth: { xs: 140, sm: 220 } }}
              >
                <Typography component="span" variant="button" noWrap>
                  {user.name}
                </Typography>
              </Button>
              <Menu
                id="user-menu"
                anchorEl={menu_anchor}
                open={Boolean(menu_anchor)}
                onClose={close_menu}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="subtitle2">{user.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                </Box>
                <Divider />
                {isAdmin && (
                  <MenuItem component={RouterLink} to="/catalog" onClick={close_menu}>
                    <ListItemIcon><InventoryOutlinedIcon fontSize="small" /></ListItemIcon>
                    Catalog
                  </MenuItem>
                )}
                <MenuItem onClick={handle_logout}>
                  <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button component={RouterLink} to="/login" variant="contained" color="primary" size="small">
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
