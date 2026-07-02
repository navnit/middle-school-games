import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CARGO_LIBRARY } from '../content/cargoLibrary';
import { MissionBoard } from './MissionBoard';

const initialCargoOrder = ['helium', 'ozone-o3'];

function createDataTransfer(): DataTransfer {
  const store = new Map<string, string>();

  return {
    dropEffect: 'move',
    effectAllowed: 'all',
    files: [] as unknown as FileList,
    items: [] as unknown as DataTransferItemList,
    types: [],
    clearData: vi.fn((format?: string) => {
      if (format) {
        store.delete(format);
        return;
      }

      store.clear();
    }),
    getData: vi.fn((format: string) => store.get(format) ?? ''),
    setData: vi.fn((format: string, data: string) => {
      store.set(format, data);
    }),
    setDragImage: vi.fn()
  };
}

describe('MissionBoard', () => {
  it('shows the Practice Mode evidence command and Cosmo guidance', () => {
    render(<MissionBoard cargoItems={CARGO_LIBRARY} initialCargoOrder={initialCargoOrder} />);

    expect(screen.getByText(/Ask For Evidence/i)).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /Cosmo coach/i })).toHaveTextContent(
      /Cosmo is listening for evidence/i
    );
  });

  it('uses Practice Mode class check before reveal and advances only after the teacher moves next', async () => {
    const user = userEvent.setup();
    render(<MissionBoard cargoItems={CARGO_LIBRARY} initialCargoOrder={initialCargoOrder} />);

    await user.click(screen.getByRole('button', { name: /Drop Helium into Atom/i }));

    expect(screen.getByRole('heading', { name: /Class Check/i })).toBeInTheDocument();
    expect(screen.getByText(/Ask the class to vote or justify before revealing/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Reveal/i }));

    expect(screen.getAllByText(/Helium is an atom/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Correct bay: Atom/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Next Cargo/i }));

    expect(screen.getByText('O3')).toBeInTheDocument();
  });

  it('damages Rescue Rush cargo and then rescues it on a second try', async () => {
    const user = userEvent.setup();
    render(<MissionBoard cargoItems={CARGO_LIBRARY} initialCargoOrder={initialCargoOrder} />);

    await user.selectOptions(screen.getByLabelText(/Mode/i), 'rescue-rush');
    await user.click(screen.getByRole('button', { name: /Drop Helium into Mixture/i }));

    expect(screen.getByRole('heading', { name: /Damaged cargo/i })).toBeInTheDocument();
    expect(screen.getByText(/Helium needs a second try/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Drop Helium into Atom/i }));

    expect(screen.getByText(/Score: 50/i)).toBeInTheDocument();
    expect(screen.getByText('O3')).toBeInTheDocument();
  });

  it('shows Cosmo coach, clock, and progress HUD in Rescue Rush', async () => {
    const user = userEvent.setup();
    render(<MissionBoard cargoItems={CARGO_LIBRARY} initialCargoOrder={initialCargoOrder} />);

    await user.selectOptions(screen.getByLabelText(/Mode/i), 'rescue-rush');

    expect(screen.getByLabelText(/Mission clock/i)).toHaveTextContent('01:30');
    expect(screen.getByRole('region', { name: /Cosmo coach/i })).toHaveTextContent(/Cosmo says: ready/i);
    expect(screen.getByRole('region', { name: /Cargo belt/i })).toBeInTheDocument();
    expect(screen.getByText(/Saved 0\/2/i)).toBeInTheDocument();
    expect(screen.getByText(/Damaged 0/i)).toBeInTheDocument();
    expect(screen.getByText(/Repair Dock 0/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Drop Helium into Mixture/i }));

    expect(screen.getByRole('region', { name: /Cosmo coach/i })).toHaveTextContent(/Cargo damaged/i);
    expect(screen.getByRole('region', { name: /Cosmo coach/i })).toHaveAttribute(
      'data-cosmo-tone',
      'warning'
    );
    expect(screen.getByText(/Damaged 1/i)).toBeInTheDocument();
  });

  it('places active cargo inside the Rescue Rush board', async () => {
    const user = userEvent.setup();
    render(<MissionBoard cargoItems={CARGO_LIBRARY} initialCargoOrder={initialCargoOrder} />);

    await user.selectOptions(screen.getByLabelText(/Mode/i), 'rescue-rush');

    const rescueBoard = screen.getByRole('region', { name: /Rescue bays/i });
    expect(within(rescueBoard).getByLabelText(/Helium cargo/i)).toBeInTheDocument();
  });

  it('moves cargo to the Repair Dock after two Rescue Rush mistakes and can mark it repaired', async () => {
    const user = userEvent.setup();
    render(<MissionBoard cargoItems={CARGO_LIBRARY} initialCargoOrder={initialCargoOrder} />);

    await user.selectOptions(screen.getByLabelText(/Mode/i), 'rescue-rush');
    await user.click(screen.getByRole('button', { name: /Drop Helium into Mixture/i }));
    await user.click(screen.getByRole('button', { name: /Drop Helium into Compound Molecule/i }));

    const repairDock = screen.getByRole('region', { name: /Repair Dock/i });
    expect(within(repairDock).getByText(/Helium/i)).toBeInTheDocument();

    await user.click(within(repairDock).getByRole('button', { name: /Mark Helium repaired/i }));

    expect(screen.queryByRole('region', { name: /Repair Dock/i })).not.toBeInTheDocument();
  });

  it('supports team turns', async () => {
    const user = userEvent.setup();
    render(<MissionBoard cargoItems={CARGO_LIBRARY} initialCargoOrder={initialCargoOrder} />);

    await user.selectOptions(screen.getByLabelText(/Play style/i), 'team-turns');
    await user.click(screen.getByRole('button', { name: /Switch Team/i }));

    expect(screen.getByText(/Current Team: Beta/i)).toBeInTheDocument();
  });

  it('shows the active cargo hint from teacher controls', async () => {
    const user = userEvent.setup();
    render(<MissionBoard cargoItems={CARGO_LIBRARY} initialCargoOrder={initialCargoOrder} />);

    await user.click(screen.getByRole('button', { name: /Hint/i }));

    expect(screen.getAllByText(/Look for one unbonded particle/i).length).toBeGreaterThan(0);
  });

  it('supports dragging active cargo onto a rescue bay', () => {
    const dataTransfer = createDataTransfer();
    render(<MissionBoard cargoItems={CARGO_LIBRARY} initialCargoOrder={initialCargoOrder} />);

    fireEvent.dragStart(screen.getByRole('article', { name: /Helium cargo/i }), { dataTransfer });
    fireEvent.dragOver(screen.getByRole('button', { name: /Drop Helium into Atom/i }), { dataTransfer });
    fireEvent.drop(screen.getByRole('button', { name: /Drop Helium into Atom/i }), { dataTransfer });

    expect(screen.getByRole('heading', { name: /Class Check/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Proposed bay: Atom/i).length).toBeGreaterThan(0);
  });
});
