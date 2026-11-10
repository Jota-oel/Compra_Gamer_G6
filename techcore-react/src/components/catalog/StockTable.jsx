import { useState } from 'react';
import {
  IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TablePagination, TableRow, Tooltip, Typography,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import { format_price, type_label } from '../../utils/format.js';

const PER_PAGE_OPTIONS = [5, 10, 25];

/**
 * Generic table for components and computers (same columns as the original).
 * rows: plain objects   kind: 'components' | 'computers'   onEdit(item)   onDelete(item)
 */
export default function StockTable({ rows, kind, onEdit, onDelete }) {
  const [page, set_page] = useState(0);
  const [per_page, set_per_page] = useState(PER_PAGE_OPTIONS[0]);

  // if filtering/deleting leaves fewer pages, fall back to the last valid one
  const last_page = Math.max(0, Math.ceil(rows.length / per_page) - 1);
  const current_page = Math.min(page, last_page);
  const visible = rows.slice(current_page * per_page, current_page * per_page + per_page);
  const price_header = kind === 'components' ? 'COST' : 'PRICE';

  return (
    <Paper variant="outlined">
      <TableContainer>
        <Table size="small" aria-label={`${kind} table`}>
          <TableHead>
            <TableRow>
              <TableCell>PRODUCT</TableCell>
              <TableCell>ID</TableCell>
              <TableCell>DESCRIPTION</TableCell>
              <TableCell align="right">{price_header}</TableCell>
              <TableCell align="right">STOCK</TableCell>
              <TableCell align="center">ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visible.map((item) => (
              <TableRow key={item.id} hover>
                <TableCell>
                  <Typography fontWeight="bold">{item.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{type_label(item.type)}</Typography>
                </TableCell>
                <TableCell>#{item.id}</TableCell>
                <TableCell sx={{ maxWidth: 360 }}>
                  <Typography variant="body2" noWrap title={item.description}>{item.description}</Typography>
                </TableCell>
                <TableCell align="right">{format_price(item.price)}</TableCell>
                <TableCell align="right">{item.stock} u.</TableCell>
                <TableCell align="center">
                  <Tooltip title="Edit product">
                    <IconButton aria-label={`Edit ${item.name}`} onClick={() => onEdit(item)}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete product">
                    <IconButton aria-label={`Delete ${item.name}`} color="error" onClick={() => onDelete(item)}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={rows.length}
        page={current_page}
        onPageChange={(_event, next) => set_page(next)}
        rowsPerPage={per_page}
        rowsPerPageOptions={PER_PAGE_OPTIONS}
        onRowsPerPageChange={(event) => {
          set_per_page(Number(event.target.value));
          set_page(0);
        }}
      />
    </Paper>
  );
}
