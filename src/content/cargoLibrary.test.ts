import { describe, expect, it } from 'vitest';
import { TARGET_LABELS } from '../domain/types';
import { CARGO_LIBRARY } from './cargoLibrary';

describe('CARGO_LIBRARY', () => {
  it('contains exactly 20 v1 cargo items', () => {
    expect(CARGO_LIBRARY).toHaveLength(20);
  });

  it('includes O3 as an element molecule', () => {
    expect(CARGO_LIBRARY.find((item) => item.id === 'ozone-o3')).toMatchObject({
      formula: 'O3',
      target: 'element-molecule'
    });
  });

  it('does not include standalone sodium chloride as v1 cargo', () => {
    expect(CARGO_LIBRARY.some((item) => item.formula === 'NaCl')).toBe(false);
  });

  it('has the required target labels for the board', () => {
    expect(TARGET_LABELS).toEqual({
      atom: 'Atom',
      'element-molecule': 'Element Molecule',
      'compound-molecule': 'Compound Molecule',
      mixture: 'Mixture'
    });
  });

  it('has complete teaching and particle fields for every cargo item', () => {
    const ids = new Set<string>();

    for (const item of CARGO_LIBRARY) {
      expect(item.id).toMatch(/^[a-z0-9-]+$/);
      expect(ids.has(item.id)).toBe(false);
      ids.add(item.id);

      expect(item.displayName.length).toBeGreaterThan(0);
      expect(['particle-diagram', 'real-world', 'hybrid']).toContain(item.kind);
      expect(Object.keys(TARGET_LABELS)).toContain(item.target);
      expect(item.hint.length).toBeGreaterThan(10);
      expect(item.explanation.length).toBeGreaterThan(20);
      expect(item.diagram.atoms.length).toBeGreaterThan(0);

      for (const atom of item.diagram.atoms) {
        expect(atom.id.length).toBeGreaterThan(0);
        expect(atom.element.length).toBeGreaterThan(0);
        expect(atom.label.length).toBeGreaterThan(0);
        expect(atom.color).toMatch(/^#[0-9a-f]{6}$/i);
        expect(atom.x).toBeGreaterThanOrEqual(0);
        expect(atom.x).toBeLessThanOrEqual(100);
        expect(atom.y).toBeGreaterThanOrEqual(0);
        expect(atom.y).toBeLessThanOrEqual(100);
      }
    }
  });
});
