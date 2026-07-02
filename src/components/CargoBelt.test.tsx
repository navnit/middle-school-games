import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CARGO_LIBRARY } from '../content/cargoLibrary';
import { CargoBelt } from './CargoBelt';

const cargoItems = CARGO_LIBRARY.filter((cargo) =>
  ['neon', 'argon', 'carbon-atom'].includes(cargo.id)
);

describe('CargoBelt', () => {
  it('renders upcoming cargo as a compact belt', () => {
    render(<CargoBelt cargoItems={cargoItems} />);

    const belt = screen.getByRole('region', { name: /Cargo belt/i });
    expect(within(belt).getByLabelText(/Neon cargo/i)).toBeInTheDocument();
    expect(within(belt).getByLabelText(/Argon cargo/i)).toBeInTheDocument();
    expect(within(belt).getByLabelText(/Carbon atom cargo/i)).toBeInTheDocument();
  });

  it('shows an empty state when there is no upcoming cargo', () => {
    render(<CargoBelt cargoItems={[]} />);

    expect(screen.getByText(/Cargo belt clear/i)).toBeInTheDocument();
  });
});
