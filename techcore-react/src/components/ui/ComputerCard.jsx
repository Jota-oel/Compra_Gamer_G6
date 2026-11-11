import { useState } from 'react';
import { Box, Button, Card, CardContent, CardMedia, Typography } from '@mui/material';
import ComputerOutlinedIcon from '@mui/icons-material/ComputerOutlined';
import { format_price } from '../../utils/format.js';
import { accent_for_type } from '../../theme/theme.js';

const CATEGORY = { gaming: 'Gaming PC', office: 'Office PC' };

/**
 * Card de una computer (MX-2). Dueño: Maxi. Se usa en el carrusel de la Home.
 * Props:
 *   computer: objeto plano de useComputers() ({ id, name, description, price, stock, url, type })
 *   onBuy(computer): se llama con ESA computer al apretar Buy. Con stock 0 el botón queda deshabilitado.
 * La descripción se recorta a 2 líneas, así no depende del formato de descripción (decisión 9).
 */
export function ComputerCard({ computer, onBuy }) {
  const [image_failed, setImageFailed] = useState(false);
  const accent = accent_for_type(computer.type);
  const in_stock = computer.stock > 0;
  const show_image = Boolean(computer.url) && !image_failed;

  return (
    <Card
      component="article"
      data-id={computer.id}
      data-type={computer.type}
      sx={(theme) => ({
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'transform 0.2s, border-color 0.2s',
        opacity: in_stock ? 1 : 0.8,
        '&:hover, &:focus-within': {
          borderColor: theme.palette[accent].main,
          transform: 'translateY(-4px)',
        },
      })}
    >
      <Box sx={{ aspectRatio: '21 / 10', bgcolor: 'background.alt', overflow: 'hidden' }}>
        {show_image ? (
          <CardMedia
            component="img"
            image={computer.url}
            alt={computer.name}
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Box sx={{ height: '100%', display: 'grid', placeItems: 'center', color: 'text.disabled' }}>
            <ComputerOutlinedIcon fontSize="large" aria-hidden />
          </Box>
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 0.5, p: 2.5, '&:last-child': { pb: 3 } }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: `${accent}.main` }}>
          {CATEGORY[computer.type] ?? computer.type}
        </Typography>
        <Typography variant="h6" component="h3" sx={{ lineHeight: 1.3 }}>
          {computer.name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            // recorte a 2 líneas, con el alto reservado para que todas las cards queden parejas
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2,
            lineClamp: 2,
            overflow: 'hidden',
            minHeight: '3em',
            wordBreak: 'break-word',
          }}
        >
          {computer.description}
        </Typography>

        <Box
          sx={{
            mt: 'auto',
            pt: 2.5,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Typography variant="h5" component="span">
            {format_price(computer.price)}
          </Typography>
          <Button
            variant="contained"
            disabled={!in_stock}
            onClick={() => onBuy?.(computer)}
            aria-label={in_stock ? `Buy ${computer.name}` : `${computer.name} is out of stock`}
            sx={{
              borderRadius: 0.5,
              px: 2.5,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontSize: '0.85rem',
              bgcolor: 'background.alt',
              color: 'text.primary',
              '&:hover, &:focus-visible': { bgcolor: `${accent}.main`, color: `${accent}.contrastText` },
            }}
          >
            {in_stock ? 'Buy' : 'Out of stock'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
