import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the Space Cargo Sorter shell', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /Space Cargo Sorter/i })).toBeInTheDocument();
    expect(screen.getByText(/Teacher-led chemistry rescue/i)).toBeInTheDocument();
  });
});
