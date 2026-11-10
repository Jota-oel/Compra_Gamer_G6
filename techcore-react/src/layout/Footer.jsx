import { Box, Divider, Link, Typography } from '@mui/material';
import logo_icon from '../assets/logo-logo.png';

// Mismo contenido que pages/footer.html del proyecto original.
const COLUMNS = [
  { title: 'Gaming Range', items: ['Custom GPUs', 'Gaming Rig Config', 'Watercooling Blocks', 'Custom Peripherals'] },
  { title: 'Workstation', items: ['ECC RAM Upgrades', 'Enterprise RAID Arrays', 'IPS Color Monitors', 'Rackmount Stations'] },
  { title: 'Information', items: ['Fast Ship Promise', 'Multi-Tier Warranty', 'System Diagnostics', 'Direct Support'] },
];

/** Pie de página (MX-1). Dueño: Maxi. Sin props. */
export function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 4,
        px: { xs: 2, sm: 3 },
        pt: { xs: 3.5, sm: 5 },
        pb: { xs: 2, sm: 3 },
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          gap: { xs: 3, md: 5 },
          maxWidth: 1300,
          mx: 'auto',
        }}
      >
        <Box sx={{ maxWidth: { md: 260 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2 }}>
            <Box component="img" src={logo_icon} alt="" width={28} height={28} />
            <Typography component="span" variant="h6" sx={{ fontSize: '1.1rem' }}>
              TECH<Box component="strong" sx={{ color: 'secondary.main' }}>CORE</Box>
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            The premium destination for performance compute components and workstation architecture.
            Overclocked, tested, and fully supported.
          </Typography>
        </Box>

        <Box
          component="nav"
          aria-label="Footer"
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(auto-fit, minmax(140px, 1fr))', md: 'repeat(3, auto)' },
            gap: { xs: 3, md: 5 },
          }}
        >
          {COLUMNS.map((column) => (
            <Box key={column.title}>
              <Typography variant="subtitle2" component="h2" sx={{ mb: 2, textTransform: 'uppercase' }}>
                {column.title}
              </Typography>
              <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none', display: 'grid', gap: 1.25 }}>
                {column.items.map((item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      onClick={(event) => event.preventDefault()}
                      color="text.secondary"
                      variant="body2"
                      sx={{ '&:hover': { color: 'primary.main' } }}
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      <Divider sx={{ maxWidth: 1300, mx: 'auto', mt: 4, mb: 2.5 }} />

      <Typography variant="caption" color="text.secondary" component="p" sx={{ textAlign: 'center' }}>
        &copy; 2026 TechCore Retail LLC. All performance metrics verified under lab conditions.
      </Typography>
    </Box>
  );
}
