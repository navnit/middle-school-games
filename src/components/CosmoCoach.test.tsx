import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { CosmoFeedback } from '../domain/cosmoFeedback';
import { CosmoCoach } from './CosmoCoach';

const feedback: CosmoFeedback = {
  tone: 'warning',
  animation: 'shake',
  headline: 'Cargo damaged',
  detail: 'Try one more bay.'
};

describe('CosmoCoach', () => {
  it('renders Cosmo as an accessible feedback region', () => {
    render(<CosmoCoach feedback={feedback} />);

    const region = screen.getByRole('region', { name: /Cosmo coach/i });
    expect(region).toHaveTextContent('Cargo damaged');
    expect(region).toHaveTextContent('Try one more bay.');
    expect(region).toHaveAttribute('aria-live', 'polite');
  });

  it('exposes tone and animation classes for CSS animation', () => {
    render(<CosmoCoach feedback={feedback} />);

    const region = screen.getByRole('region', { name: /Cosmo coach/i });
    expect(region).toHaveAttribute('data-cosmo-tone', 'warning');
    expect(region).toHaveClass('cosmo-coach--warning');
    expect(region).toHaveClass('cosmo-coach--shake');
  });
});
