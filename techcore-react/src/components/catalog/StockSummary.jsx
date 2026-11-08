import { Typography } from '@mui/material';
import { format_price } from '../../utils/format.js';

/** "Showing X of Y products in catalog — total value $Z" (same text as the original). */
export default function StockSummary({ shown, total, value }) {
  return (
    <Typography variant="body2" color="text.secondary">
      Showing {shown} of {total} products in catalog — total value {format_price(value, { decimals: 0 })}
    </Typography>
  );
}
