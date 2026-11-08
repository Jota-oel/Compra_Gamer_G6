import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { ComputerCard } from '../ui/ComputerCard.jsx';
import { next_scroll_left } from '../../utils/carousel.js';

const AUTOPLAY_MS = 5000;
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

/**
 * Carrusel responsive de ComputerCard (MX-3). Dueño: Maxi.
 * Props:
 *   computers: lista de computers (objetos planos)
 *   onBuy(computer): se pasa a cada card
 *   accent: 'primary' | 'secondary' (color de flechas y foco)   label: nombre accesible del carrusel
 *   autoplay_ms: intervalo del autoplay (0 lo desactiva)
 * Comportamiento:
 *   - 3 / 2 / 1 cards visibles según el ancho (breakpoints md / sm / xs)
 *   - el desplazamiento es nativo (CSS scroll-snap): funciona con touch y trackpad
 *   - flechas (se ocultan si todas las cards entran) y vuelta al llegar al final / al inicio
 *   - autoplay que se pausa con el mouse, el foco del teclado y la pestaña oculta
 *     (y no corre si el sistema pide reducir el movimiento)
 */
export function ProductCarousel({ computers, onBuy, accent = 'primary', label = 'Featured computers', autoplay_ms = AUTOPLAY_MS }) {
  const track_ref = useRef(null);
  const [scrollable, setScrollable] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [tab_hidden, setTabHidden] = useState(() => document.hidden);
  const [reduced_motion, setReducedMotion] = useState(() => window.matchMedia(REDUCED_MOTION).matches);

  const count = computers.length;
  const paused = hovered || focused || tab_hidden;
  const autoplaying = scrollable && !paused && !reduced_motion && autoplay_ms > 0;

  const move = useCallback((direction) => {
    const track = track_ref.current;
    if (!track?.firstElementChild) return;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const left = next_scroll_left({
      scroll_left: track.scrollLeft,
      max: track.scrollWidth - track.clientWidth,
      step: track.firstElementChild.getBoundingClientRect().width + gap,
      direction,
    });
    if (left === null) return;
    track.scrollTo({ left, behavior: window.matchMedia(REDUCED_MOTION).matches ? 'auto' : 'smooth' });
  }, []);

  // ¿entran todas las cards? (depende del ancho y de la cantidad)
  useEffect(() => {
    const track = track_ref.current;
    if (!track) return undefined;
    const update = () => setScrollable(track.scrollWidth - track.clientWidth > 1);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(track);
    return () => observer.disconnect();
  }, [count]);

  // pestaña oculta y preferencia de movimiento reducido
  useEffect(() => {
    const on_visibility = () => setTabHidden(document.hidden);
    const media = window.matchMedia(REDUCED_MOTION);
    const on_motion = (event) => setReducedMotion(event.matches);
    document.addEventListener('visibilitychange', on_visibility);
    media.addEventListener('change', on_motion);
    return () => {
      document.removeEventListener('visibilitychange', on_visibility);
      media.removeEventListener('change', on_motion);
    };
  }, []);

  // autoplay
  useEffect(() => {
    if (!autoplaying) return undefined;
    const timer = setInterval(() => move(1), autoplay_ms);
    return () => clearInterval(timer);
  }, [autoplaying, autoplay_ms, move]);

  if (count === 0) {
    return <Typography color="text.secondary">No computers available.</Typography>;
  }

  const arrow_sx = (theme) => ({
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 2,
    bgcolor: 'rgba(18, 24, 47, 0.9)',
    border: `1px solid ${theme.palette.border.light}`,
    borderRadius: 0.5,
    '&:hover, &:focus-visible': { bgcolor: `${accent}.main`, color: `${accent}.contrastText` },
  });

  return (
    <Box
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={(event) => {
        // solo el foco del teclado pausa: tras clickear una flecha con el mouse el autoplay sigue
        if (event.target.matches(':focus-visible')) setFocused(true);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
      sx={(theme) => ({
        position: 'relative',
        '--gap': '1.5rem',
        '--visible': '1',
        [theme.breakpoints.up('sm')]: { '--visible': '2' },
        [theme.breakpoints.up('md')]: { '--visible': '3' },
      })}
    >
      {scrollable && (
        <>
          <IconButton aria-label="Previous computers" onClick={() => move(-1)} sx={[arrow_sx, { left: 8 }]}>
            <ChevronLeftIcon />
          </IconButton>
          <IconButton aria-label="Next computers" onClick={() => move(1)} sx={[arrow_sx, { right: 8 }]}>
            <ChevronRightIcon />
          </IconButton>
        </>
      )}

      <Box
        component="ul"
        ref={track_ref}
        tabIndex={0}
        aria-label={`${label}: use the arrow keys to scroll`}
        aria-live={autoplaying ? 'off' : 'polite'}
        sx={(theme) => ({
          display: 'grid',
          gridAutoFlow: 'column',
          gridAutoColumns: 'calc((100% - (var(--visible) - 1) * var(--gap)) / var(--visible))',
          gap: 'var(--gap)',
          m: 0,
          px: 0,
          py: 1, // lugar para el desplazamiento vertical de la card en hover
          listStyle: 'none',
          overflowX: 'auto',
          overscrollBehaviorX: 'contain',
          scrollSnapType: 'x mandatory',
          scrollBehavior: 'smooth',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
          '&:focus-visible': { outlineColor: theme.palette[accent].main },
          '@media (prefers-reduced-motion: reduce)': { scrollBehavior: 'auto' },
        })}
      >
        {computers.map((computer) => (
          <Box component="li" key={computer.id} sx={{ minWidth: 0, scrollSnapAlign: 'start' }}>
            <ComputerCard computer={computer} onBuy={onBuy} />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
