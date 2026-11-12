import { useState } from 'react';
import { Box } from '@mui/material';
import { useComputers } from '../hooks/useComputers.js';
import { useFilteredList } from '../hooks/useFilteredList.js';
import { Hero } from '../components/home/Hero.jsx';
import { ShowcaseSection } from '../components/home/ShowcaseSection.jsx';
import { ComputerDetailDialog } from '../components/dialogs/ComputerDetailDialog.jsx';

/**
 * Home (MX-2). Dueño: Maxi. One page: Hero + sección Gaming + sección Office.
 * Guarda `selected_computer`: Buy deja ahí la computer elegida (el detalle lo abre <ComputerDetailDialog />).
 */
export default function Home() {
  const { computers, loading, error, reload } = useComputers();
  const gaming = useFilteredList(computers, { type: 'gaming' });
  const office = useFilteredList(computers, { type: 'office' });
  const [selected_computer, setSelectedComputer] = useState(null);

  const handle_buy = (computer) => setSelectedComputer(computer);

  const section_props = { loading, error, onRetry: reload, onBuy: handle_buy };

  return (
    <Box data-selected-computer={selected_computer?.id ?? ''}>
      <Hero />
      <ShowcaseSection type="gaming" computers={gaming} {...section_props} />
      <ShowcaseSection type="office" computers={office} {...section_props} />

      <ComputerDetailDialog
        open={Boolean(selected_computer)}
        computer={selected_computer}
        onClose={() => setSelectedComputer(null)}
      />
    </Box>
  );
}
