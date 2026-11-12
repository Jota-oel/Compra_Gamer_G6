import { Link as RouterLink } from 'react-router';
import { Box, Button, Card, CardContent, Chip, Typography } from '@mui/material';

const PATHS = [
  {
    id: 'gaming',
    title: 'Gaming Division',
    text: 'Overclocked GPUs, liquid-cooled custom rigs, and ultra-responsive custom mechanical peripherals.',
    action: 'Explore Gaming Hardware',
    color: 'secondary',
    to: { pathname: '/', hash: '#gaming' },
  },
  {
    id: 'office',
    title: 'Pro Workstation',
    text: 'Multi-threaded CPUs, enterprise-tier high endurance SSD arrays, and color-accurate monitor arrays.',
    action: 'Explore Professional Gear',
    color: 'primary',
    to: { pathname: '/', hash: '#office' },
  },
];

/** "Choose your path": presentación + dos tarjetas que llevan a las secciones Gaming y Office (MX-2). Sin props. */
export function Hero() {
  return (
    <Box
      component="section"
      id="home"
      aria-labelledby="hero-title"
      sx={{ maxWidth: 900, mx: 'auto', py: { xs: 4, md: 8 } }}
    >
      <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 7 } }}>
        <Chip
          label="Ultimate performance retailer"
          variant="outlined"
          color="primary"
          sx={{ mb: 2.5, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.7rem' }}
        />
        <Typography
          id="hero-title"
          variant="h1"
          sx={{ mb: 2.5, fontSize: 'clamp(2rem, 4vw, 3rem)' }}
        >
          Choose Your Path: Elite Gaming or Extreme Productivity
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 700, mx: 'auto', fontSize: '1.125rem' }}>
          Whether you are conquering virtual battlefields or rendering 8K video timelines, TechCore
          engineers the components, rigs, and customized configurations to power your vision.
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 4 }}>
        {PATHS.map((path) => (
          <Card
            key={path.id}
            sx={(theme) => ({
              borderTop: `3px solid ${theme.palette[path.color].main}`,
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-8px)' },
            })}
          >
            <CardContent
              sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2.5, p: { xs: 3, md: 5 }, '&:last-child': { pb: { xs: 3, md: 5 } } }}
            >
              <Typography variant="h5" component="h2">{path.title}</Typography>
              <Typography color="text.secondary" sx={{ flexGrow: 1 }}>{path.text}</Typography>
              <Button component={RouterLink} to={path.to} variant="contained" color={path.color} size="large">
                {path.action}
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
