import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DropBin } from './DropBin';

describe('DropBin', () => {
  it('renders Atom and submits the atom target', async () => {
    const user = userEvent.setup();
    const onDrop = vi.fn();

    render(<DropBin kind="atom" activeCargoName="Helium" onDrop={onDrop} />);

    await user.click(screen.getByRole('button', { name: /Drop Helium into Atom/i }));

    expect(screen.getByText('Atom')).toBeInTheDocument();
    expect(onDrop).toHaveBeenCalledWith('atom');
  });

  it('renders Mixture and submits the mixture target', async () => {
    const user = userEvent.setup();
    const onDrop = vi.fn();

    render(<DropBin kind="mixture" activeCargoName="Lemonade" onDrop={onDrop} />);

    await user.click(screen.getByRole('button', { name: /Drop Lemonade into Mixture/i }));

    expect(screen.getByText('Mixture')).toBeInTheDocument();
    expect(onDrop).toHaveBeenCalledWith('mixture');
  });

  it('renders the nested molecule bins and submits the chosen targets', async () => {
    const user = userEvent.setup();
    const onDrop = vi.fn();

    render(<DropBin kind="molecule" activeCargoName="Ozone" onDrop={onDrop} />);

    await user.click(screen.getByRole('button', { name: /Drop Ozone into Element Molecule/i }));
    await user.click(screen.getByRole('button', { name: /Drop Ozone into Compound Molecule/i }));

    expect(screen.getByText('Molecule')).toBeInTheDocument();
    expect(screen.getByText('Element Molecule')).toBeInTheDocument();
    expect(screen.getByText('Compound Molecule')).toBeInTheDocument();
    expect(onDrop).toHaveBeenNthCalledWith(1, 'element-molecule');
    expect(onDrop).toHaveBeenNthCalledWith(2, 'compound-molecule');
  });
});
