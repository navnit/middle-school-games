import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CARGO_LIBRARY } from '../content/cargoLibrary';
import { CargoCard } from './CargoCard';

describe('CargoCard', () => {
  it('shows formula, name, particle diagram, and damaged state', () => {
    const ozone = CARGO_LIBRARY.find((item) => item.id === 'ozone-o3')!;

    render(<CargoCard cargo={ozone} state="damaged" onSelect={vi.fn()} />);

    expect(screen.getByRole('button', { name: /Select Ozone cargo/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Ozone particle diagram/i })).toBeInTheDocument();
    expect(screen.getByText('Ozone')).toBeInTheDocument();
    expect(screen.getByText('O3')).toBeInTheDocument();
    expect(screen.getByText(/Damaged/i)).toBeInTheDocument();
  });

  it('shows repair dock status and submits the selected cargo id', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const lemonade = CARGO_LIBRARY.find((item) => item.id === 'lemonade')!;

    render(<CargoCard cargo={lemonade} state="repair-dock" onSelect={onSelect} />);

    expect(screen.queryByText('undefined')).not.toBeInTheDocument();
    expect(screen.getByText('Repair Dock')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Select Lemonade cargo/i }));

    expect(onSelect).toHaveBeenCalledWith('lemonade');
  });

  it('renders display-only cargo without a dead button', () => {
    const helium = CARGO_LIBRARY.find((item) => item.id === 'helium')!;

    render(<CargoCard cargo={helium} state="queued" />);

    expect(screen.getByRole('article', { name: /Helium cargo/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Select Helium cargo/i })).not.toBeInTheDocument();
  });
});
