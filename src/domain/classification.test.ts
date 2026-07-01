import { describe, expect, it } from 'vitest';
import { CARGO_LIBRARY } from '../content/cargoLibrary';
import { validateDrop } from './classification';
import type { TargetId } from './types';

describe('validateDrop', () => {
  it.each([
    ['helium', 'atom'],
    ['ozone-o3', 'element-molecule'],
    ['water-h2o', 'compound-molecule'],
    ['salt-water', 'mixture']
  ] satisfies Array<[string, TargetId]>)('accepts the correct target for %s', (cargoId, target) => {
    const cargo = CARGO_LIBRARY.find((item) => item.id === cargoId);

    expect(cargo).toBeDefined();
    expect(validateDrop(cargo!, target)).toMatchObject({
      cargoId,
      isCorrect: true,
      expectedTarget: target,
      receivedTarget: target
    });
  });

  it('rejects a molecule dropped into the atom bin', () => {
    const ozone = CARGO_LIBRARY.find((item) => item.id === 'ozone-o3');

    expect(ozone).toBeDefined();
    expect(validateDrop(ozone!, 'atom')).toMatchObject({
      cargoId: 'ozone-o3',
      isCorrect: false,
      expectedTarget: 'element-molecule',
      receivedTarget: 'atom'
    });
  });

  it('returns the cargo explanation for teacher reveal text', () => {
    const water = CARGO_LIBRARY.find((item) => item.id === 'water-h2o');

    expect(water).toBeDefined();
    expect(validateDrop(water!, 'compound-molecule').explanation).toContain(
      'different elements bonded together'
    );
  });
});
