import type { CargoItem, ParticleAtom, ParticleBond, TargetId } from '../domain/types';

const colors: Record<string, string> = {
  Ar: '#c4b5fd',
  C: '#64748b',
  Ca: '#d6d3d1',
  Cereal: '#d97706',
  Cl: '#22c55e',
  Fe: '#b45309',
  Food: '#f59e0b',
  H: '#f8fafc',
  He: '#8fd3ff',
  Lemon: '#facc15',
  Milk: '#f8fafc',
  Mineral: '#78716c',
  N: '#3b82f6',
  Na: '#a7f3d0',
  Ne: '#fca5a5',
  O: '#ef4444',
  Organic: '#65a30d',
  Sand: '#ca8a04',
  Sugar: '#fef3c7',
  Water: '#38bdf8'
};

function atom(id: string, element: string, x: number, y: number, label = element): ParticleAtom {
  return {
    id,
    element,
    label,
    x,
    y,
    color: colors[element] ?? '#e2e8f0'
  };
}

function bond(from: string, to: string): ParticleBond {
  return { from, to };
}

function makeItem(
  id: string,
  displayName: string,
  formula: string | undefined,
  kind: CargoItem['kind'],
  target: TargetId,
  atoms: ParticleAtom[],
  bonds: ParticleBond[],
  hint: string,
  explanation: string,
  teacherNote?: string
): CargoItem {
  return {
    id,
    displayName,
    formula,
    kind,
    target,
    hint,
    explanation,
    teacherNote,
    diagram: { atoms, bonds }
  };
}

export const CARGO_LIBRARY: CargoItem[] = [
  makeItem(
    'helium',
    'Helium',
    'He',
    'particle-diagram',
    'atom',
    [atom('he1', 'He', 50, 50)],
    [],
    'Look for one unbonded particle.',
    'Helium is an atom here because it is a single unbonded helium particle.'
  ),
  makeItem(
    'neon',
    'Neon',
    'Ne',
    'particle-diagram',
    'atom',
    [atom('ne1', 'Ne', 50, 50)],
    [],
    'Look for one unbonded particle.',
    'Neon is an atom here because it is a single unbonded neon particle.'
  ),
  makeItem(
    'argon',
    'Argon',
    'Ar',
    'particle-diagram',
    'atom',
    [atom('ar1', 'Ar', 50, 50)],
    [],
    'Look for one unbonded particle.',
    'Argon is an atom here because it is a single unbonded argon particle.'
  ),
  makeItem(
    'carbon-atom',
    'Carbon atom',
    'C',
    'particle-diagram',
    'atom',
    [atom('c1', 'C', 50, 50)],
    [],
    'Look for one unbonded particle.',
    'A single carbon particle is an atom because it is not bonded to another atom.'
  ),
  makeItem(
    'oxygen-o2',
    'Oxygen',
    'O2',
    'hybrid',
    'element-molecule',
    [atom('o1', 'O', 35, 50), atom('o2', 'O', 65, 50)],
    [bond('o1', 'o2')],
    'Check whether all bonded atoms are the same element.',
    'O2 is an element molecule because the bonded atoms are all oxygen.'
  ),
  makeItem(
    'ozone-o3',
    'Ozone',
    'O3',
    'hybrid',
    'element-molecule',
    [atom('o1', 'O', 30, 58), atom('o2', 'O', 50, 35), atom('o3', 'O', 70, 58)],
    [bond('o1', 'o2'), bond('o2', 'o3')],
    'It is bonded, and every atom is oxygen.',
    'O3 is an element molecule because all three bonded atoms are oxygen.'
  ),
  makeItem(
    'nitrogen-n2',
    'Nitrogen',
    'N2',
    'hybrid',
    'element-molecule',
    [atom('n1', 'N', 35, 50), atom('n2', 'N', 65, 50)],
    [bond('n1', 'n2')],
    'Check whether all bonded atoms are the same element.',
    'N2 is an element molecule because the bonded atoms are all nitrogen.'
  ),
  makeItem(
    'hydrogen-h2',
    'Hydrogen',
    'H2',
    'hybrid',
    'element-molecule',
    [atom('h1', 'H', 35, 50), atom('h2', 'H', 65, 50)],
    [bond('h1', 'h2')],
    'Check whether all bonded atoms are the same element.',
    'H2 is an element molecule because the bonded atoms are all hydrogen.'
  ),
  makeItem(
    'chlorine-cl2',
    'Chlorine',
    'Cl2',
    'hybrid',
    'element-molecule',
    [atom('cl1', 'Cl', 35, 50), atom('cl2', 'Cl', 65, 50)],
    [bond('cl1', 'cl2')],
    'Check whether all bonded atoms are the same element.',
    'Cl2 is an element molecule because the bonded atoms are all chlorine.'
  ),
  makeItem(
    'water-h2o',
    'Water',
    'H2O',
    'hybrid',
    'compound-molecule',
    [atom('o1', 'O', 50, 42), atom('h1', 'H', 32, 64), atom('h2', 'H', 68, 64)],
    [bond('o1', 'h1'), bond('o1', 'h2')],
    'Look for different elements bonded together.',
    'H2O is a compound molecule because different elements bonded together make one water particle.'
  ),
  makeItem(
    'carbon-dioxide',
    'Carbon dioxide',
    'CO2',
    'hybrid',
    'compound-molecule',
    [atom('o1', 'O', 25, 50), atom('c1', 'C', 50, 50), atom('o2', 'O', 75, 50)],
    [bond('o1', 'c1'), bond('c1', 'o2')],
    'Look for different elements bonded together.',
    'CO2 is a compound molecule because carbon and oxygen atoms are bonded together.'
  ),
  makeItem(
    'methane',
    'Methane',
    'CH4',
    'hybrid',
    'compound-molecule',
    [
      atom('c1', 'C', 50, 50),
      atom('h1', 'H', 50, 22),
      atom('h2', 'H', 50, 78),
      atom('h3', 'H', 22, 50),
      atom('h4', 'H', 78, 50)
    ],
    [bond('c1', 'h1'), bond('c1', 'h2'), bond('c1', 'h3'), bond('c1', 'h4')],
    'Look for different elements bonded together.',
    'CH4 is a compound molecule because carbon and hydrogen atoms are bonded together.'
  ),
  makeItem(
    'ammonia',
    'Ammonia',
    'NH3',
    'hybrid',
    'compound-molecule',
    [atom('n1', 'N', 50, 45), atom('h1', 'H', 28, 68), atom('h2', 'H', 72, 68), atom('h3', 'H', 50, 18)],
    [bond('n1', 'h1'), bond('n1', 'h2'), bond('n1', 'h3')],
    'Look for different elements bonded together.',
    'NH3 is a compound molecule because nitrogen and hydrogen atoms are bonded together.'
  ),
  makeItem(
    'air',
    'Air',
    undefined,
    'real-world',
    'mixture',
    [
      atom('n1', 'N', 22, 36),
      atom('n2', 'N', 38, 36),
      atom('o1', 'O', 62, 60),
      atom('o2', 'O', 78, 60),
      atom('ar1', 'Ar', 50, 26)
    ],
    [bond('n1', 'n2'), bond('o1', 'o2')],
    'Look for more than one substance sharing the same space.',
    'Air is a mixture because nitrogen, oxygen, argon, and other gases are together without becoming one bonded particle type.'
  ),
  makeItem(
    'salt-water',
    'Salt water',
    undefined,
    'real-world',
    'mixture',
    [
      atom('o1', 'O', 28, 42),
      atom('h1', 'H', 16, 58),
      atom('h2', 'H', 40, 58),
      atom('na1', 'Na', 65, 36),
      atom('cl1', 'Cl', 78, 64)
    ],
    [bond('o1', 'h1'), bond('o1', 'h2')],
    'The salt and water are together, but they are not one molecule.',
    'Salt water is a mixture because water and dissolved salt particles are together without forming one single bonded molecule.',
    'V1 avoids standalone table salt cargo because the board sorts molecules, not ionic crystal structures.'
  ),
  makeItem(
    'lemonade',
    'Lemonade',
    undefined,
    'real-world',
    'mixture',
    [
      atom('water1', 'Water', 22, 34),
      atom('water2', 'Water', 62, 66),
      atom('sugar1', 'Sugar', 42, 48),
      atom('lemon1', 'Lemon', 76, 30),
      atom('lemon2', 'Lemon', 30, 72)
    ],
    [],
    'Look for water, sugar, and lemon substances together.',
    'Lemonade is a mixture because water, sugar, and lemon juice are combined but not chemically bonded into one molecule.'
  ),
  makeItem(
    'trail-mix',
    'Trail mix',
    undefined,
    'real-world',
    'mixture',
    [
      atom('nut1', 'Food', 24, 30, 'Nut'),
      atom('raisin1', 'Food', 58, 35, 'Raisin'),
      atom('seed1', 'Food', 78, 62, 'Seed'),
      atom('chip1', 'Food', 36, 70, 'Chip')
    ],
    [],
    'The parts stay visibly separate after mixing.',
    'Trail mix is a mixture because the nuts, raisins, seeds, and other pieces remain separate substances.'
  ),
  makeItem(
    'soil',
    'Soil',
    undefined,
    'real-world',
    'mixture',
    [
      atom('sand1', 'Sand', 22, 34),
      atom('mineral1', 'Mineral', 48, 26),
      atom('organic1', 'Organic', 70, 46),
      atom('water1', 'Water', 36, 72),
      atom('fe1', 'Fe', 76, 72)
    ],
    [],
    'Look for several natural materials together.',
    'Soil is a mixture because minerals, organic matter, water, and tiny rock pieces are together without becoming one molecule.'
  ),
  makeItem(
    'cereal-with-milk',
    'Cereal with milk',
    undefined,
    'real-world',
    'mixture',
    [
      atom('cereal1', 'Cereal', 24, 34),
      atom('milk1', 'Milk', 52, 36),
      atom('cereal2', 'Cereal', 76, 60),
      atom('milk2', 'Milk', 36, 70)
    ],
    [],
    'The cereal and milk are together, but still separate materials.',
    'Cereal with milk is a mixture because cereal pieces and milk share the bowl without bonding into one new molecule.'
  ),
  makeItem(
    'ocean-water',
    'Ocean water',
    undefined,
    'real-world',
    'mixture',
    [
      atom('water1', 'Water', 20, 34),
      atom('water2', 'Water', 44, 60),
      atom('na1', 'Na', 68, 34),
      atom('cl1', 'Cl', 80, 62),
      atom('sand1', 'Sand', 32, 78),
      atom('ca1', 'Ca', 58, 78)
    ],
    [],
    'Look for water plus dissolved and tiny suspended substances.',
    'Ocean water is a mixture because water, salts, minerals, and tiny particles are together without forming one single molecule.'
  )
];
