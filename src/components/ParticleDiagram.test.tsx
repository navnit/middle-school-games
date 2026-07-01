import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CARGO_LIBRARY } from '../content/cargoLibrary';
import { ParticleDiagram } from './ParticleDiagram';

describe('ParticleDiagram', () => {
  it('renders atom labels and bonds for O3', () => {
    const ozone = CARGO_LIBRARY.find((item) => item.id === 'ozone-o3')!;
    const { container } = render(<ParticleDiagram diagram={ozone.diagram} title="Ozone particles" />);

    expect(screen.getByRole('img', { name: /Ozone particles/i })).toBeInTheDocument();
    expect(screen.getAllByText('O')).toHaveLength(3);
    expect(container.querySelectorAll('[data-particle-bond]')).toHaveLength(2);
  });

  it('marks ions and mixture components with distinct node kind hooks', () => {
    const oceanWater = CARGO_LIBRARY.find((item) => item.id === 'ocean-water')!;
    const { container } = render(
      <ParticleDiagram diagram={oceanWater.diagram} title="Ocean water particles" />
    );

    expect(container.querySelectorAll('[data-node-kind="ion"]').length).toBeGreaterThan(0);
    expect(container.querySelectorAll('[data-node-kind="mixture-component"]').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Water mixture component').length).toBeGreaterThan(0);
    expect(screen.getByText('Na ion')).toBeInTheDocument();
  });
});
