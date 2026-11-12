import { useState } from 'react';
import { Alert, Box, Button, Stack, Tab, Tabs, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useComponents } from '../hooks/useComponents.js';
import { useComputers } from '../hooks/useComputers.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { useFilteredList } from '../hooks/useFilteredList.js';
import { useNotify } from '../hooks/useNotify.js';
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

export default function Catalog() {
  const components_state = useComponents();
  const computers_state = useComputers();
  const { notify } = useNotify();

  const [tab, set_tab] = useState('components');
  // one filter per tab: filtering one never touches the other
  const [filters, set_filters] = useState({ components: INITIAL_FILTERS, computers: INITIAL_FILTERS });
  const [form_state, set_form_state] = useState({ open: false, mode: 'components', item: null });
  const [to_delete, set_to_delete] = useState(null); // { item, kind }
  const [deleting, set_deleting] = useState(false);

  const open_form = (item = null) => set_form_state({ open: true, mode: tab, item });
  const close_form = () => set_form_state((current) => ({ ...current, open: false, item: null }));

  const confirm_delete = async () => {
    if (!to_delete) return;
    const { item, kind } = to_delete;
    const remove = kind === 'components' ? components_state.remove : computers_state.remove;
    set_deleting(true);
    try {
      await remove(item.id);
      notify(`"${item.name}" deleted`, 'success');
      set_to_delete(null);
    } catch (failure) {
      notify(failure.message, 'error');
    } finally {
      set_deleting(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}
      >
        <Box>
          <Typography variant="h4" component="h1">Component Management</Typography>
          <Typography color="text.secondary">
            Manage the catalog, stock, and costs of components and computers.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => open_form(null)}
          sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
        >
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
