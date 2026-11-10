import { Alert, CircularProgress, Stack, Typography } from '@mui/material';
import { useComponents } from '../hooks/useComponents.js';
import { useComputers } from '../hooks/useComputers.js';
import { value_total } from '../utils/filters.js';
import { COMPONENT_TYPES } from '../models/Component.js';
import { COMPUTER_TYPES } from '../models/Computer.js';
import CatalogFilters from '../components/catalog/CatalogFilters.jsx';
import StockSummary from '../components/catalog/StockSummary.jsx';
import StockTable from '../components/catalog/StockTable.jsx';
import { ProductFormDialog } from '../components/dialogs/ProductFormDialog.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ListSkeleton from '../components/ui/ListSkeleton.jsx';

const INITIAL_FILTERS = { type: 'all', text: '' };

/** Filters + summary + table of ONE tab. Receives its own filter state from the page. */
function CatalogPanel({ kind, items, loading, error, types, filters, on_filters, on_edit, on_delete }) {
  const label = kind === 'components' ? 'component' : 'computer';
  const debounced_text = useDebounce(filters.text, 300);
  const filtered = useFilteredList(items, { type: filters.type, text: debounced_text });

  let content;
  if (loading) content = <ListSkeleton />;
  else if (error) content = <Alert severity="error">{error.message}</Alert>;
  else if (filtered.length === 0) content = <EmptyState message="No products found." />;
  else content = <StockTable rows={filtered} kind={kind} onEdit={on_edit} onDelete={on_delete} />;

  return (
    <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '280px 1fr' }, alignItems: 'start' }}>
      <Stack spacing={2}>
        <Typography variant="h6">Search and Filters</Typography>
        <CatalogFilters value={filters} onChange={on_filters} types={types} label={label} />
      </Stack>
      <Stack spacing={2}>
        {content}
        {!loading && !error && (
          <StockSummary shown={filtered.length} total={items.length} value={value_total(filtered)} />
        )}
      </Stack>
    </Box>
  );
}

/** PLACEHOLDER (proves the data flow). Dev B builds the real Catalog (tabs, filters, tables). */
export default function Catalog() {
  const { components, loading: loading_components, error: components_error } = useComponents();
  const { computers, loading: loading_computers, error: computers_error } = useComputers();

  if (loading_components || loading_computers) return <CircularProgress />;
  const error = components_error ?? computers_error;
  if (error) return <Alert severity="error">{error.message}</Alert>;

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}>
        <Box>
          <Typography variant="h4" component="h1">Component Management</Typography>
          <Typography color="text.secondary">
            Manage the catalog, stock, and costs of components and computers.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => open_form(null)}>
          Create new product
        </Button>
      </Stack>

      <Tabs value={tab} onChange={(_event, next) => set_tab(next)} aria-label="Catalog view">
        <Tab value="components" label="Components" />
        <Tab value="computers" label="Computers" />
      </Tabs>

      {tab === 'components' ? (
        <CatalogPanel
          key="components"
          kind="components"
          items={components_state.components}
          loading={components_state.loading}
          error={components_state.error}
          types={COMPONENT_TYPES}
          filters={filters.components}
          on_filters={(next) => set_filters((current) => ({ ...current, components: next }))}
          on_edit={(item) => open_form(item)}
          on_delete={(item) => set_to_delete({ item, kind: 'components' })}
        />
      ) : (
        <CatalogPanel
          key="computers"
          kind="computers"
          items={computers_state.computers}
          loading={computers_state.loading}
          error={computers_state.error}
          types={COMPUTER_TYPES}
          filters={filters.computers}
          on_filters={(next) => set_filters((current) => ({ ...current, computers: next }))}
          on_edit={(item) => open_form(item)}
          on_delete={(item) => set_to_delete({ item, kind: 'computers' })}
        />
      )}

      <ConfirmDialog
        open={Boolean(to_delete)}
        title={`Delete "${to_delete?.item.name ?? ''}"?`}
        message="This action cannot be undone."
        loading={deleting}
        onConfirm={confirm_delete}
        onClose={() => set_to_delete(null)}
      />

      <ProductFormDialog open={form_state.open} mode={form_state.mode} item={form_state.item} onClose={close_form} />
    </Stack>
  );
}
