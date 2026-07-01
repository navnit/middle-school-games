import { describe, expect, it } from 'vitest';
import { TARGET_LABELS } from '../domain/types';
import { CARGO_LIBRARY } from './cargoLibrary';
import type { TargetId } from '../domain/types';

const EXPECTED_V1_CARGO_TARGETS = [
  ['helium', 'atom'],
  ['neon', 'atom'],
  ['argon', 'atom'],
  ['carbon-atom', 'atom'],
  ['oxygen-o2', 'element-molecule'],
  ['ozone-o3', 'element-molecule'],
  ['nitrogen-n2', 'element-molecule'],
  ['hydrogen-h2', 'element-molecule'],
  ['chlorine-cl2', 'element-molecule'],
  ['water-h2o', 'compound-molecule'],
  ['carbon-dioxide', 'compound-molecule'],
  ['methane', 'compound-molecule'],
  ['ammonia', 'compound-molecule'],
  ['air', 'mixture'],
  ['salt-water', 'mixture'],
  ['lemonade', 'mixture'],
  ['trail-mix', 'mixture'],
  ['soil', 'mixture'],
  ['cereal-with-milk', 'mixture'],
  ['ocean-water', 'mixture']
] satisfies Array<[string, TargetId]>;

const MIXTURE_COMPONENT_LABELS = new Set([
  'Water',
  'Sugar',
  'Lemon',
  'Nut',
  'Raisin',
  'Seed',
  'Chip',
  'Sand',
  'Mineral',
  'Organic',
  'Iron',
  'Cereal',
  'Milk',
  'Calcium'
]);

describe('CARGO_LIBRARY', () => {
  it('contains exactly 20 v1 cargo items', () => {
    expect(CARGO_LIBRARY).toHaveLength(20);
  });

  it('keeps the stable v1 cargo id and target matrix', () => {
    expect(CARGO_LIBRARY.map((item) => [item.id, item.target])).toEqual(EXPECTED_V1_CARGO_TARGETS);
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

      for (const node of item.diagram.atoms) {
        expect(node.id.length).toBeGreaterThan(0);
        expect(node.element.length).toBeGreaterThan(0);
        expect(node.label.length).toBeGreaterThan(0);
        expect(['atom', 'molecule', 'ion', 'mixture-component']).toContain(node.nodeKind);
        expect(node.color).toMatch(/^#[0-9a-f]{6}$/i);
        expect(node.x).toBeGreaterThanOrEqual(0);
        expect(node.x).toBeLessThanOrEqual(100);
        expect(node.y).toBeGreaterThanOrEqual(0);
        expect(node.y).toBeLessThanOrEqual(100);
      }
    }
  });

  it('tags real-world mixture components separately from chemical atoms', () => {
    const realWorldMixtures = CARGO_LIBRARY.filter(
      (item) => item.target === 'mixture' && item.kind === 'real-world'
    );

    for (const item of realWorldMixtures) {
      for (const node of item.diagram.atoms) {
        if (MIXTURE_COMPONENT_LABELS.has(node.label)) {
          expect(node.nodeKind).toBe('mixture-component');
        }
      }
    }

    const saltWater = CARGO_LIBRARY.find((item) => item.id === 'salt-water');
    expect(saltWater?.diagram.atoms.find((node) => node.id === 'na1')?.nodeKind).toBe('ion');
    expect(saltWater?.diagram.atoms.find((node) => node.id === 'cl1')?.nodeKind).toBe('ion');
  });

  it('tags atomic-symbol diagrams as atoms unless they are shown as ions', () => {
    for (const item of CARGO_LIBRARY.filter((cargo) => cargo.target !== 'mixture')) {
      expect(item.diagram.atoms.every((node) => node.nodeKind === 'atom')).toBe(true);
    }

    const air = CARGO_LIBRARY.find((item) => item.id === 'air');
    expect(air?.diagram.atoms.every((node) => node.nodeKind === 'atom')).toBe(true);

    const saltWater = CARGO_LIBRARY.find((item) => item.id === 'salt-water');
    expect(saltWater?.diagram.atoms.find((node) => node.id === 'o1')?.nodeKind).toBe('atom');
    expect(saltWater?.diagram.atoms.find((node) => node.id === 'h1')?.nodeKind).toBe('atom');
    expect(saltWater?.diagram.atoms.find((node) => node.id === 'h2')?.nodeKind).toBe('atom');
  });

  it('uses valid node ids for every particle bond', () => {
    for (const item of CARGO_LIBRARY) {
      const nodeIds = new Set(item.diagram.atoms.map((node) => node.id));

      for (const bond of item.diagram.bonds) {
        expect(nodeIds.has(bond.from)).toBe(true);
        expect(nodeIds.has(bond.to)).toBe(true);
      }
    }
  });
});
