import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CARGO_LIBRARY } from '../content/cargoLibrary';
import type { ParticleDiagram as ParticleDiagramData } from '../domain/types';
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
    expect(screen.getAllByText('ion').length).toBeGreaterThan(0);
    expect(screen.getAllByText('mix').length).toBeGreaterThan(0);
    expect(container.querySelector('[data-node-kind="ion"] .particle-kind-caption')).toHaveTextContent('ion');
    expect(container.querySelector('[data-node-kind="mixture-component"] .particle-kind-caption')).toHaveTextContent(
      'mix'
    );
  });

  it('marks molecule nodes with their own visual hook and caption', () => {
    const moleculeDiagram: ParticleDiagramData = {
      atoms: [
        {
          id: 'm1',
          nodeKind: 'molecule',
          element: 'O',
          label: 'O2',
          x: 50,
          y: 50,
          color: '#3b82f6'
        }
      ],
      bonds: []
    };
    const { container } = render(
      <ParticleDiagram diagram={moleculeDiagram} title="Molecule node sample" />
    );

    expect(screen.getByRole('img', { name: /Molecule node sample/i })).toBeInTheDocument();
    expect(container.querySelector('[data-node-kind="molecule"]')).toBeInTheDocument();
    expect(container.querySelector('[data-node-kind="molecule"] .particle-molecule-ring')).toBeInTheDocument();
    expect(screen.getByText('mol')).toBeInTheDocument();
  });
});
