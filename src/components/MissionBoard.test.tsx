import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { CARGO_LIBRARY } from '../content/cargoLibrary';
import { MissionBoard } from './MissionBoard';

const initialCargoOrder = ['helium', 'ozone-o3'];

describe('MissionBoard', () => {
  it('uses Practice Mode class check before reveal and advances only after the teacher moves next', async () => {
    const user = userEvent.setup();
    render(<MissionBoard cargoItems={CARGO_LIBRARY} initialCargoOrder={initialCargoOrder} />);

    await user.click(screen.getByRole('button', { name: /Drop Helium into Atom/i }));

    expect(screen.getByRole('heading', { name: /Class Check/i })).toBeInTheDocument();
    expect(screen.getByText(/Ask the class to vote or justify before revealing/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Reveal/i }));

    expect(screen.getByText(/Helium is an atom/i)).toBeInTheDocument();
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

    expect(screen.getByText(/Look for one unbonded particle/i)).toBeInTheDocument();
  });
});
