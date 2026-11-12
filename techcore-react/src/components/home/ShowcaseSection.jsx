import { Link as RouterLink } from 'react-router';
import { Alert, Box, Button, Skeleton, Typography } from '@mui/material';
import { ProductCarousel } from './ProductCarousel.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { accent_for_type } from '../../theme/theme.js';

const CONTENT = {
  gaming: { tag: 'GAMING CLASS', title: 'Zero Bottleneck Hardware', link: 'View all gaming gear' },
  office: { tag: 'PROFESSIONAL GRADE', title: 'Productivity & Workstations', link: 'View all workstation gear' },
};
const SKELETON_COUNT = 3;

/**
 * Sección de la Home con las computers de un tipo (MX-2). Dueño: Maxi.
 * Props:
 *   type: 'gaming' | 'office'  (define textos, color y el id de la sección: #gaming / #office)
 *   computers: lista YA filtrada por tipo (la Home usa useFilteredList)
 *   loading, error, onRetry: estados de carga y error de useComputers()
 *   onBuy(computer): se pasa a cada card
 * La sección siempre se renderiza (aunque cargue o falle) para que los links #gaming / #office funcionen.
 */
export function ShowcaseSection({ type, computers, loading = false, error = null, onRetry, onBuy }) {
  const { isAdmin } = useAuth();
  const content = CONTENT[type];
  if (!content) throw new Error(`Unknown showcase type "${type}"`);
  const accent = accent_for_type(type);

  const grid_sx = {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' },
    gap: 3,
    p: 0,
    m: 0,
    listStyle: 'none',
  };

  let body;
  if (loading) {
    body = (
      <Box sx={grid_sx} aria-busy="true" aria-label="Loading computers">
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <Skeleton key={index} variant="rounded" height={380} />
        ))}
      </Box>
    );
  } else if (error) {
    body = (
      <Alert
        severity="error"
        action={onRetry && <Button color="inherit" size="small" onClick={onRetry}>Retry</Button>}
      >
        Could not load the computers: {error.message}
      </Alert>
    );
  } else if (computers.length === 0) {
    body = <Typography color="text.secondary">No computers available.</Typography>;
  } else {
    body = <ProductCarousel computers={computers} onBuy={onBuy} accent={accent} label={content.title} />;
  }

  return (
    <Box
      component="section"
      id={type}
      aria-labelledby={`${type}-title`}
      sx={{ width: '100%', maxWidth: 1280, mx: 'auto', py: { xs: 5, md: 8 } }}
    >
      <Box
        sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 2, mb: 3 }}
      >
        <Box>
          <Typography variant="overline" sx={{ color: `${accent}.main`, fontWeight: 700, letterSpacing: '0.1em' }}>
            {content.tag}
          </Typography>
          <Typography id={`${type}-title`} variant="h2" sx={{ mt: 0.5, fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}>
            {content.title}
          </Typography>
        </Box>
        {isAdmin && (
          <Button component={RouterLink} to="/catalog" color={accent} variant="outlined" size="small">
            {content.link}
          </Button>
        )}
      </Box>
      {body}
    </Box>
  );
}
