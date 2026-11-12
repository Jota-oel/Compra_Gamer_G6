import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { Box, Container } from '@mui/material';
import { Navbar } from './Navbar.jsx';
import { Footer } from './Footer.jsx';
import { CartDialog } from '../components/cart/CartDialog.jsx';

/**
 * Lleva la página a la sección del hash (/#gaming) o arriba del todo al cambiar de ruta.
 * Reintenta unos frames por si la sección aparece un instante después de navegar.
 */
function useScrollToHash() {
  const { pathname, hash, key } = useLocation(); // `key` cambia en cada navegación: repetir el mismo link vuelve a scrollear

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0 });
      return undefined;
    }
    let frame = 0;
    let attempts = 0;
    const try_scroll = () => {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (target) {
        target.scrollIntoView();
      } else if (attempts < 20) {
        attempts += 1;
        frame = requestAnimationFrame(try_scroll);
      }
    };
    try_scroll();
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash, key]);
}

/**
 * Estructura de la página (MX-1). Dueño: Maxi. <Outlet /> es el lugar de cada página.
 * Guarda `cart_open`: el botón del carrito del Navbar lo deja en true.
 */
export function MainLayout() {
  const [cart_open, setCartOpen] = useState(false);
  useScrollToHash();

  return (
    <Box
      data-cart-open={cart_open}
      sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      <Navbar onCartClick={() => setCartOpen(true)} />

      <Container component="main" maxWidth="xl" sx={{ flexGrow: 1, py: { xs: 2, md: 3 } }}>
        <Outlet />
      </Container>

      <Footer />

      <CartDialog open={cart_open} onClose={() => setCartOpen(false)} />
    </Box>
  );
}
