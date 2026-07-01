# Space Cargo Sorter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the v1 teacher-led touchscreen Space Cargo Sorter web app from the approved design spec.

**Architecture:** React owns the classroom UI, while chemistry content, classification validation, and game flow live in pure TypeScript modules. The board uses touch-friendly DOM interactions with large targets, click/tap fallback, and clear feedback states. There is no backend; all state lives in the browser session.

**Tech Stack:** React, TypeScript, Vite, Vitest, Testing Library, Playwright, plain CSS.

---

## Visual Reference

Use `docs/superpowers/assets/space-cargo-sorter-concept.png` as the visual reference for the v1 Mission Board. It establishes the intended feel: bright space cargo bay, large classroom-readable targets, crisp particle diagrams, functional side panels, blue/green/orange accents, and a nested molecule bay in the center.

The approved spec and this plan remain the source of truth for exact copy, cargo order, scoring, and behavior. Do not implement concept-only filler such as a teacher profile name, robot lore, or extra story text unless it is also required by the plan. Preserve the concept's layout hierarchy, palette direction, and touch-target scale while keeping visible text aligned to the approved game requirements.

## File Structure

- Create `package.json`: npm scripts and dependencies.
- Create `index.html`: Vite HTML entry.
- Create `tsconfig.json`, `tsconfig.node.json`: TypeScript settings.
- Create `vite.config.ts`: Vite, React, and Vitest configuration.
- Create `vitest.setup.ts`: Testing Library matcher setup.
- Create `src/main.tsx`: React root bootstrap.
- Create `src/App.tsx`: app shell and Mission Board composition.
- Create `src/styles.css`: responsive classroom/touchscreen styles.
- Create `src/domain/types.ts`: category, cargo, particle, mode, and game-state types.
- Create `src/domain/classification.ts`: pure target validation helpers.
- Create `src/domain/gameState.ts`: reducer and action creators for Practice Mode, Rescue Rush, teams, repair dock, reveal, undo, and pause.
- Create `src/content/cargoLibrary.ts`: v1 cargo item data.
- Create `src/components/ParticleDiagram.tsx`: SVG particle renderer.
- Create `src/components/CargoCard.tsx`: active/upcoming cargo card.
- Create `src/components/DropBin.tsx`: Atom, Mixture, and nested Molecule drop targets.
- Create `src/components/TeacherControls.tsx`: hint, reveal, next, undo, pause, mode, and team controls.
- Create `src/components/MissionBoard.tsx`: board layout and interaction wiring.
- Create `src/**/*.test.tsx` and `src/**/*.test.ts`: unit and interaction coverage.
- Create `e2e/mission-board.spec.ts`: browser smoke coverage for layout and flows.
- Create `playwright.config.ts`: browser verification configuration.

## Task 1: Scaffold React, Vite, TypeScript, and Test Harness

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `vitest.setup.ts`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/App.test.tsx`
- Create: `src/styles.css`

- [ ] **Step 1: Create the npm project definition**

Write `package.json`:

```json
{
  "name": "space-cargo-sorter",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "tsc --noEmit && vite build",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.49.1",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^19.0.2",
    "@types/react-dom": "^19.0.2",
    "@vitejs/plugin-react": "^4.3.4",
    "jsdom": "^25.0.1",
    "typescript": "^5.7.2",
    "vite": "^6.0.6",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run: `npm install`

Expected: `package-lock.json` is created and npm reports installed packages without errors.

- [ ] **Step 3: Add TypeScript and Vite configuration**

Write `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2020"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src", "vite.config.ts", "vitest.setup.ts", "playwright.config.ts", "e2e"]
}
```

Write `tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts", "playwright.config.ts"]
}
```

Write `vite.config.ts`:

```ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true
  }
});
```

Write `vitest.setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 4: Write the first failing app smoke test**

Write `src/App.test.tsx`:

```tsx
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
```

- [ ] **Step 5: Run the smoke test and verify it fails**

Run: `npm test -- src/App.test.tsx`

Expected: FAIL because `src/App.tsx` does not exist yet.

- [ ] **Step 6: Create the minimal app shell**

Write `index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Space Cargo Sorter</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Write `src/main.tsx`:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

Write `src/App.tsx`:

```tsx
export default function App() {
  return (
    <main className="app-shell">
      <section className="hero-panel" aria-labelledby="app-title">
        <p className="eyebrow">Teacher-led chemistry rescue</p>
        <h1 id="app-title">Space Cargo Sorter</h1>
        <p className="hero-copy">
          Route atoms, molecules, and mixtures into the correct cargo bays.
        </p>
      </section>
    </main>
  );
}
```

Write `src/styles.css`:

```css
:root {
  color: #182033;
  background: #f3f7fb;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
}

button,
input,
select {
  font: inherit;
}

.app-shell {
  min-height: 100vh;
  padding: 24px;
}

.hero-panel {
  min-height: calc(100vh - 48px);
  border: 1px solid #d8e2ef;
  border-radius: 8px;
  background: #ffffff;
  display: grid;
  place-content: center;
  text-align: center;
}

.eyebrow {
  margin: 0 0 12px;
  color: #3d5a80;
  font-size: 16px;
  font-weight: 800;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-size: clamp(42px, 6vw, 84px);
}

.hero-copy {
  max-width: 680px;
  margin: 18px auto 0;
  color: #475569;
  font-size: 22px;
  line-height: 1.45;
}
```

- [ ] **Step 7: Run tests and build**

Run: `npm test -- src/App.test.tsx`

Expected: PASS.

Run: `npm run build`

Expected: TypeScript and Vite build complete without errors.

- [ ] **Step 8: Commit scaffold**

Run:

```bash
git add package.json package-lock.json index.html tsconfig.json tsconfig.node.json vite.config.ts vitest.setup.ts src
git commit -m "feat: scaffold Space Cargo Sorter app"
```

Expected: commit succeeds.

## Task 2: Add Chemistry Domain Model, Cargo Library, and Classification Rules

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/domain/classification.ts`
- Create: `src/domain/classification.test.ts`
- Create: `src/content/cargoLibrary.ts`
- Create: `src/content/cargoLibrary.test.ts`

- [ ] **Step 1: Write classification tests first**

Write `src/domain/classification.test.ts`:

```ts
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
      isCorrect: true,
      expectedTarget: target,
      receivedTarget: target
    });
  });

  it('rejects a molecule dropped into the atom bin', () => {
    const ozone = CARGO_LIBRARY.find((item) => item.id === 'ozone-o3');

    expect(validateDrop(ozone!, 'atom')).toMatchObject({
      isCorrect: false,
      expectedTarget: 'element-molecule',
      receivedTarget: 'atom'
    });
  });

  it('returns the cargo explanation for teacher reveal text', () => {
    const water = CARGO_LIBRARY.find((item) => item.id === 'water-h2o');

    expect(validateDrop(water!, 'compound-molecule').explanation).toContain(
      'different elements bonded together'
    );
  });
});
```

Write `src/content/cargoLibrary.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
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

  it('has complete teaching fields for every cargo item', () => {
    for (const item of CARGO_LIBRARY) {
      expect(item.id).toMatch(/^[a-z0-9-]+$/);
      expect(item.displayName.length).toBeGreaterThan(0);
      expect(item.hint.length).toBeGreaterThan(10);
      expect(item.explanation.length).toBeGreaterThan(20);
      expect(item.diagram.atoms.length).toBeGreaterThan(0);
    }
  });

  it('does not include standalone sodium chloride as v1 cargo', () => {
    expect(CARGO_LIBRARY.some((item) => item.formula === 'NaCl')).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests and verify they fail**

Run: `npm test -- src/domain/classification.test.ts src/content/cargoLibrary.test.ts`

Expected: FAIL because the domain and content files do not exist yet.

- [ ] **Step 3: Create domain types**

Write `src/domain/types.ts`:

```ts
export type TargetId = 'atom' | 'element-molecule' | 'compound-molecule' | 'mixture';

export type MainBinId = 'atom' | 'molecule' | 'mixture';

export type GameMode = 'practice' | 'rescue-rush';

export type PlayStyle = 'co-op' | 'team-turns';

export type CargoKind = 'particle-diagram' | 'real-world' | 'hybrid';

export interface ParticleAtom {
  id: string;
  element: string;
  label: string;
  x: number;
  y: number;
  color: string;
}

export interface ParticleBond {
  from: string;
  to: string;
}

export interface ParticleDiagram {
  atoms: ParticleAtom[];
  bonds: ParticleBond[];
}

export interface CargoItem {
  id: string;
  displayName: string;
  formula?: string;
  kind: CargoKind;
  target: TargetId;
  hint: string;
  explanation: string;
  teacherNote?: string;
  diagram: ParticleDiagram;
}

export interface ValidationResult {
  cargoId: string;
  isCorrect: boolean;
  expectedTarget: TargetId;
  receivedTarget: TargetId;
  explanation: string;
}

export const TARGET_LABELS: Record<TargetId, string> = {
  atom: 'Atom',
  'element-molecule': 'Element Molecule',
  'compound-molecule': 'Compound Molecule',
  mixture: 'Mixture'
};

export const MAIN_BIN_LABELS: Record<MainBinId, string> = {
  atom: 'Atom',
  molecule: 'Molecule',
  mixture: 'Mixture'
};
```

- [ ] **Step 4: Create classification helpers**

Write `src/domain/classification.ts`:

```ts
import type { CargoItem, TargetId, ValidationResult } from './types';
import { TARGET_LABELS } from './types';

export function isMoleculeTarget(target: TargetId): boolean {
  return target === 'element-molecule' || target === 'compound-molecule';
}

export function getTargetLabel(target: TargetId): string {
  return TARGET_LABELS[target];
}

export function validateDrop(cargo: CargoItem, receivedTarget: TargetId): ValidationResult {
  return {
    cargoId: cargo.id,
    isCorrect: cargo.target === receivedTarget,
    expectedTarget: cargo.target,
    receivedTarget,
    explanation: cargo.explanation
  };
}
```

- [ ] **Step 5: Create cargo library data**

Write `src/content/cargoLibrary.ts` with all 20 v1 items:

```ts
import type { CargoItem, ParticleAtom, ParticleBond, TargetId } from '../domain/types';

const colors: Record<string, string> = {
  He: '#8fd3ff',
  Ne: '#fca5a5',
  Ar: '#c4b5fd',
  C: '#64748b',
  O: '#ef4444',
  N: '#3b82f6',
  H: '#f8fafc',
  Cl: '#22c55e',
  W: '#38bdf8',
  X: '#f59e0b',
  S: '#a16207',
  M: '#94a3b8'
};

function atom(id: string, element: string, x: number, y: number): ParticleAtom {
  return { id, element, label: element, x, y, color: colors[element] ?? '#e2e8f0' };
}

function makeItem(
  id: string,
  displayName: string,
  formula: string | undefined,
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
    kind: formula ? 'hybrid' : 'real-world',
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
    'element-molecule',
    [atom('o1', 'O', 35, 50), atom('o2', 'O', 65, 50)],
    [{ from: 'o1', to: 'o2' }],
    'Check whether all bonded atoms are the same element.',
    'O2 is an element molecule because the bonded atoms are all oxygen.'
  ),
  makeItem(
    'ozone-o3',
    'Ozone',
    'O3',
    'element-molecule',
    [atom('o1', 'O', 30, 58), atom('o2', 'O', 50, 35), atom('o3', 'O', 70, 58)],
    [
      { from: 'o1', to: 'o2' },
      { from: 'o2', to: 'o3' }
    ],
    'It is bonded, and every atom is oxygen.',
    'O3 is an element molecule because all three bonded atoms are oxygen.'
  ),
  makeItem(
    'nitrogen-n2',
    'Nitrogen',
    'N2',
    'element-molecule',
    [atom('n1', 'N', 35, 50), atom('n2', 'N', 65, 50)],
    [{ from: 'n1', to: 'n2' }],
    'Check whether all bonded atoms are the same element.',
    'N2 is an element molecule because the bonded atoms are all nitrogen.'
  ),
  makeItem(
    'hydrogen-h2',
    'Hydrogen',
    'H2',
    'element-molecule',
    [atom('h1', 'H', 35, 50), atom('h2', 'H', 65, 50)],
    [{ from: 'h1', to: 'h2' }],
    'Check whether all bonded atoms are the same element.',
    'H2 is an element molecule because the bonded atoms are all hydrogen.'
  ),
  makeItem(
    'chlorine-cl2',
    'Chlorine',
    'Cl2',
    'element-molecule',
    [atom('cl1', 'Cl', 35, 50), atom('cl2', 'Cl', 65, 50)],
    [{ from: 'cl1', to: 'cl2' }],
    'Check whether all bonded atoms are the same element.',
    'Cl2 is an element molecule because the bonded atoms are all chlorine.'
  ),
  makeItem(
    'water-h2o',
    'Water',
    'H2O',
    'compound-molecule',
    [atom('o1', 'O', 50, 42), atom('h1', 'H', 32, 64), atom('h2', 'H', 68, 64)],
    [
      { from: 'o1', to: 'h1' },
      { from: 'o1', to: 'h2' }
    ],
    'Look for different elements bonded together.',
    'H2O is a compound molecule because hydrogen and oxygen atoms are bonded together.'
  ),
  makeItem(
    'carbon-dioxide',
    'Carbon dioxide',
    'CO2',
    'compound-molecule',
    [atom('o1', 'O', 25, 50), atom('c1', 'C', 50, 50), atom('o2', 'O', 75, 50)],
    [
      { from: 'o1', to: 'c1' },
      { from: 'c1', to: 'o2' }
    ],
    'Look for different elements bonded together.',
    'CO2 is a compound molecule because carbon and oxygen atoms are bonded together.'
  ),
  makeItem(
    'methane',
    'Methane',
    'CH4',
    'compound-molecule',
    [
      atom('c1', 'C', 50, 50),
      atom('h1', 'H', 50, 22),
      atom('h2', 'H', 50, 78),
      atom('h3', 'H', 22, 50),
      atom('h4', 'H', 78, 50)
    ],
    [
      { from: 'c1', to: 'h1' },
      { from: 'c1', to: 'h2' },
      { from: 'c1', to: 'h3' },
      { from: 'c1', to: 'h4' }
    ],
    'Look for different elements bonded together.',
    'CH4 is a compound molecule because carbon and hydrogen atoms are bonded together.'
  ),
  makeItem(
    'ammonia',
    'Ammonia',
    'NH3',
    'compound-molecule',
    [atom('n1', 'N', 50, 45), atom('h1', 'H', 28, 68), atom('h2', 'H', 72, 68), atom('h3', 'H', 50, 18)],
    [
      { from: 'n1', to: 'h1' },
      { from: 'n1', to: 'h2' },
      { from: 'n1', to: 'h3' }
    ],
    'Look for different elements bonded together.',
    'NH3 is a compound molecule because nitrogen and hydrogen atoms are bonded together.'
  ),
  makeItem(
    'air',
    'Air',
    undefined,
    'mixture',
    [atom('n1', 'N', 25, 35), atom('n2', 'N', 42, 35), atom('o1', 'O', 68, 62), atom('o2', 'O', 84, 62), atom('ar1', 'Ar', 30, 78)],
    [
      { from: 'n1', to: 'n2' },
      { from: 'o1', to: 'o2' }
    ],
    'Look for more than one substance together.',
    'Air is a mixture because it contains different substances together, such as nitrogen, oxygen, and argon.'
  ),
  makeItem(
    'salt-water',
    'Salt water',
    undefined,
    'mixture',
    [atom('w1', 'W', 30, 38), atom('w2', 'W', 48, 58), atom('s1', 'S', 72, 42), atom('w3', 'W', 68, 75)],
    [],
    'Look for water and dissolved salt together.',
    'Salt water is a mixture because salt and water are together without forming one molecule.',
    'Use this item as a mixture, not as standalone solid NaCl.'
  ),
  makeItem(
    'lemonade',
    'Lemonade',
    undefined,
    'mixture',
    [atom('w1', 'W', 25, 40), atom('x1', 'X', 48, 50), atom('x2', 'X', 68, 35), atom('w2', 'W', 72, 72)],
    [],
    'Look for water, sugar, and lemon substances together.',
    'Lemonade is a mixture because multiple substances are combined without becoming one kind of molecule.'
  ),
  makeItem(
    'trail-mix',
    'Trail mix',
    undefined,
    'mixture',
    [atom('x1', 'X', 26, 30), atom('m1', 'M', 56, 35), atom('s1', 'S', 35, 68), atom('x2', 'X', 74, 68)],
    [],
    'Look for visibly different pieces together.',
    'Trail mix is a mixture because different foods are physically combined.'
  ),
  makeItem(
    'soil',
    'Soil',
    undefined,
    'mixture',
    [atom('s1', 'S', 20, 48), atom('m1', 'M', 45, 34), atom('x1', 'X', 64, 58), atom('s2', 'S', 82, 72)],
    [],
    'Look for different materials together.',
    'Soil is a mixture because it contains different materials such as minerals, organic matter, air, and water.'
  ),
  makeItem(
    'cereal-milk',
    'Cereal with milk',
    undefined,
    'mixture',
    [atom('w1', 'W', 30, 52), atom('x1', 'X', 48, 38), atom('x2', 'X', 66, 60), atom('w2', 'W', 76, 36)],
    [],
    'Look for two foods together but not chemically bonded.',
    'Cereal with milk is a mixture because cereal and milk are physically combined.'
  ),
  makeItem(
    'ocean-water',
    'Ocean water',
    undefined,
    'mixture',
    [atom('w1', 'W', 24, 36), atom('w2', 'W', 44, 58), atom('s1', 'S', 64, 44), atom('m1', 'M', 78, 72)],
    [],
    'Look for water, salts, and other substances together.',
    'Ocean water is a mixture because water, salts, and other substances are together.'
  )
];
```

- [ ] **Step 6: Run domain/content tests**

Run: `npm test -- src/domain/classification.test.ts src/content/cargoLibrary.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit domain and content**

Run:

```bash
git add src/domain src/content
git commit -m "feat: add chemistry cargo model"
```

Expected: commit succeeds.

## Task 3: Add Game State Reducer for Practice, Rescue Rush, Teams, Undo, and Repair Dock

**Files:**
- Create: `src/domain/gameState.ts`
- Create: `src/domain/gameState.test.ts`

- [ ] **Step 1: Write reducer tests first**

Write `src/domain/gameState.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { CARGO_LIBRARY } from '../content/cargoLibrary';
import { createInitialGameState, gameReducer } from './gameState';

const cargoOrder = ['helium', 'ozone-o3', 'water-h2o'];

describe('gameReducer', () => {
  it('puts practice drops into class-check before reveal', () => {
    const state = createInitialGameState(CARGO_LIBRARY, { cargoOrder, mode: 'practice' });
    const next = gameReducer(state, { type: 'drop-on-target', target: 'atom' });

    expect(next.phase).toBe('class-check');
    expect(next.classCheck).toMatchObject({
      cargoId: 'helium',
      proposedTarget: 'atom',
      result: { isCorrect: true }
    });
    expect(next.rescuedCargoIds).toEqual([]);
  });

  it('reveals and advances practice cargo', () => {
    const state = createInitialGameState(CARGO_LIBRARY, { cargoOrder, mode: 'practice' });
    const checked = gameReducer(state, { type: 'drop-on-target', target: 'atom' });
    const revealed = gameReducer(checked, { type: 'reveal' });
    const advanced = gameReducer(revealed, { type: 'next-cargo' });

    expect(revealed.phase).toBe('revealed');
    expect(revealed.rescuedCargoIds).toEqual(['helium']);
    expect(advanced.activeCargoId).toBe('ozone-o3');
    expect(advanced.phase).toBe('ready');
  });

  it('scores first-try Rescue Rush drops at 100 points', () => {
    const state = createInitialGameState(CARGO_LIBRARY, { cargoOrder, mode: 'rescue-rush' });
    const next = gameReducer(state, { type: 'drop-on-target', target: 'atom' });

    expect(next.scores.Alpha).toBe(100);
    expect(next.rescuedCargoIds).toEqual(['helium']);
    expect(next.activeCargoId).toBe('ozone-o3');
  });

  it('damages Rescue Rush cargo on first wrong drop and rescues for 50 points on second try', () => {
    const state = createInitialGameState(CARGO_LIBRARY, { cargoOrder, mode: 'rescue-rush' });
    const damaged = gameReducer(state, { type: 'drop-on-target', target: 'mixture' });
    const rescued = gameReducer(damaged, { type: 'drop-on-target', target: 'atom' });

    expect(damaged.damagedCargoIds).toEqual(['helium']);
    expect(damaged.activeCargoId).toBe('helium');
    expect(rescued.scores.Alpha).toBe(50);
    expect(rescued.rescuedCargoIds).toEqual(['helium']);
  });

  it('moves Rescue Rush cargo to repair dock after two wrong drops', () => {
    const state = createInitialGameState(CARGO_LIBRARY, { cargoOrder, mode: 'rescue-rush' });
    const damaged = gameReducer(state, { type: 'drop-on-target', target: 'mixture' });
    const repair = gameReducer(damaged, { type: 'drop-on-target', target: 'compound-molecule' });

    expect(repair.repairDockCargoIds).toEqual(['helium']);
    expect(repair.activeCargoId).toBe('ozone-o3');
    expect(repair.scores.Alpha).toBe(0);
  });

  it('tracks team turns separately from classification behavior', () => {
    const state = createInitialGameState(CARGO_LIBRARY, {
      cargoOrder,
      mode: 'rescue-rush',
      playStyle: 'team-turns'
    });
    const scored = gameReducer(state, { type: 'drop-on-target', target: 'atom' });
    const switched = gameReducer(scored, { type: 'switch-team' });

    expect(scored.scores.Alpha).toBe(100);
    expect(scored.scores.Beta).toBe(0);
    expect(switched.currentTeamIndex).toBe(1);
  });

  it('stores an active cargo hint request', () => {
    const state = createInitialGameState(CARGO_LIBRARY, { cargoOrder, mode: 'practice' });
    const hinted = gameReducer(state, { type: 'show-hint' });

    expect(hinted.hintedCargoId).toBe('helium');
  });

  it('undo restores the previous state', () => {
    const state = createInitialGameState(CARGO_LIBRARY, { cargoOrder, mode: 'rescue-rush' });
    const scored = gameReducer(state, { type: 'drop-on-target', target: 'atom' });
    const undone = gameReducer(scored, { type: 'undo' });

    expect(undone.activeCargoId).toBe('helium');
    expect(undone.scores.Alpha).toBe(0);
    expect(undone.rescuedCargoIds).toEqual([]);
  });
});
```

- [ ] **Step 2: Run reducer tests and verify they fail**

Run: `npm test -- src/domain/gameState.test.ts`

Expected: FAIL because `src/domain/gameState.ts` does not exist.

- [ ] **Step 3: Implement reducer and state helpers**

Write `src/domain/gameState.ts`:

```ts
import { validateDrop } from './classification';
import type { CargoItem, GameMode, PlayStyle, TargetId, ValidationResult } from './types';

export type GamePhase = 'ready' | 'class-check' | 'revealed' | 'round-complete';

export interface ClassCheckState {
  cargoId: string;
  proposedTarget: TargetId;
  result: ValidationResult;
}

export interface GameState {
  cargoItems: CargoItem[];
  cargoOrder: string[];
  activeCargoId?: string;
  activeIndex: number;
  mode: GameMode;
  playStyle: PlayStyle;
  phase: GamePhase;
  paused: boolean;
  teams: string[];
  currentTeamIndex: number;
  scores: Record<string, number>;
  attemptsByCargoId: Record<string, number>;
  rescuedCargoIds: string[];
  damagedCargoIds: string[];
  repairDockCargoIds: string[];
  hintedCargoId?: string;
  classCheck?: ClassCheckState;
  revealed?: ValidationResult;
  history: GameSnapshot[];
}

type GameSnapshot = Omit<GameState, 'history'>;

export type GameAction =
  | { type: 'drop-on-target'; target: TargetId }
  | { type: 'reveal' }
  | { type: 'next-cargo' }
  | { type: 'mark-repaired'; cargoId: string }
  | { type: 'show-hint' }
  | { type: 'toggle-pause' }
  | { type: 'set-mode'; mode: GameMode }
  | { type: 'set-play-style'; playStyle: PlayStyle }
  | { type: 'switch-team' }
  | { type: 'undo' }
  | { type: 'reset' };

interface InitialOptions {
  cargoOrder?: string[];
  mode?: GameMode;
  playStyle?: PlayStyle;
}

const DEFAULT_TEAMS = ['Alpha', 'Beta'];

export function createInitialGameState(
  cargoItems: CargoItem[],
  options: InitialOptions = {}
): GameState {
  const cargoOrder = options.cargoOrder ?? cargoItems.map((item) => item.id);
  return {
    cargoItems,
    cargoOrder,
    activeCargoId: cargoOrder[0],
    activeIndex: 0,
    mode: options.mode ?? 'practice',
    playStyle: options.playStyle ?? 'co-op',
    phase: cargoOrder.length > 0 ? 'ready' : 'round-complete',
    paused: false,
    teams: DEFAULT_TEAMS,
    currentTeamIndex: 0,
    scores: { Alpha: 0, Beta: 0 },
    attemptsByCargoId: {},
    rescuedCargoIds: [],
    damagedCargoIds: [],
    repairDockCargoIds: [],
    history: []
  };
}

export function getActiveCargo(state: GameState): CargoItem | undefined {
  return state.cargoItems.find((item) => item.id === state.activeCargoId);
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (action.type === 'undo') {
    const previous = state.history[state.history.length - 1];
    return previous ? { ...previous, history: state.history.slice(0, -1) } : state;
  }

  if (action.type === 'reset') {
    return createInitialGameState(state.cargoItems, {
      cargoOrder: state.cargoOrder,
      mode: state.mode,
      playStyle: state.playStyle
    });
  }

  if (action.type === 'toggle-pause') {
    return withHistory(state, { ...state, paused: !state.paused });
  }

  if (state.paused && action.type !== 'toggle-pause') {
    return state;
  }

  switch (action.type) {
    case 'set-mode':
      return withHistory(state, {
        ...createInitialGameState(state.cargoItems, {
          cargoOrder: state.cargoOrder,
          mode: action.mode,
          playStyle: state.playStyle
        })
      });
    case 'set-play-style':
      return withHistory(state, { ...state, playStyle: action.playStyle });
    case 'switch-team':
      return withHistory(state, {
        ...state,
        currentTeamIndex: (state.currentTeamIndex + 1) % state.teams.length
      });
    case 'show-hint': {
      const cargo = getActiveCargo(state);
      return cargo ? withHistory(state, { ...state, hintedCargoId: cargo.id }) : state;
    }
    case 'drop-on-target':
      return handleDrop(state, action.target);
    case 'reveal':
      return handleReveal(state);
    case 'next-cargo':
      return withHistory(
        state,
        advanceToNextCargo({
          ...state,
          classCheck: undefined,
          revealed: undefined,
          hintedCargoId: undefined
        })
      );
    case 'mark-repaired':
      return withHistory(state, {
        ...state,
        repairDockCargoIds: state.repairDockCargoIds.filter((id) => id !== action.cargoId),
        rescuedCargoIds: addUnique(state.rescuedCargoIds, action.cargoId)
      });
    default:
      return state;
  }
}

function handleDrop(state: GameState, target: TargetId): GameState {
  const cargo = getActiveCargo(state);
  if (!cargo) {
    return state;
  }

  const result = validateDrop(cargo, target);

  if (state.mode === 'practice') {
    return withHistory(state, {
      ...state,
      phase: 'class-check',
      classCheck: { cargoId: cargo.id, proposedTarget: target, result }
    });
  }

  if (result.isCorrect) {
    const previousAttempts = state.attemptsByCargoId[cargo.id] ?? 0;
    const points = previousAttempts > 0 ? 50 : 100;
    const team = state.teams[state.currentTeamIndex];
    return withHistory(
      state,
      advanceToNextCargo({
        ...state,
        scores: { ...state.scores, [team]: state.scores[team] + points },
        rescuedCargoIds: addUnique(state.rescuedCargoIds, cargo.id),
        damagedCargoIds: state.damagedCargoIds.filter((id) => id !== cargo.id)
      })
    );
  }

  const attempts = (state.attemptsByCargoId[cargo.id] ?? 0) + 1;
  if (attempts === 1) {
    return withHistory(state, {
      ...state,
      attemptsByCargoId: { ...state.attemptsByCargoId, [cargo.id]: attempts },
      damagedCargoIds: addUnique(state.damagedCargoIds, cargo.id)
    });
  }

  return withHistory(
    state,
    advanceToNextCargo({
      ...state,
      attemptsByCargoId: { ...state.attemptsByCargoId, [cargo.id]: attempts },
      repairDockCargoIds: addUnique(state.repairDockCargoIds, cargo.id),
      damagedCargoIds: state.damagedCargoIds.filter((id) => id !== cargo.id)
    })
  );
}

function handleReveal(state: GameState): GameState {
  if (!state.classCheck) {
    return state;
  }

  return withHistory(state, {
    ...state,
    phase: 'revealed',
    revealed: state.classCheck.result,
    rescuedCargoIds: addUnique(state.rescuedCargoIds, state.classCheck.cargoId)
  });
}

function advanceToNextCargo(state: GameState): GameState {
  const blocked = new Set([...state.rescuedCargoIds, ...state.repairDockCargoIds]);
  const nextIndex = state.cargoOrder.findIndex((cargoId, index) => {
    return index > state.activeIndex && !blocked.has(cargoId);
  });

  if (nextIndex === -1) {
    return { ...state, activeCargoId: undefined, activeIndex: state.cargoOrder.length, phase: 'round-complete' };
  }

  return {
    ...state,
    activeCargoId: state.cargoOrder[nextIndex],
    activeIndex: nextIndex,
    phase: 'ready'
  };
}

function withHistory(previous: GameState, next: GameState): GameState {
  return { ...next, history: [...previous.history, snapshot(previous)] };
}

function snapshot(state: GameState): GameSnapshot {
  const { history, ...rest } = state;
  return rest;
}

function addUnique(values: string[], value: string): string[] {
  return values.includes(value) ? values : [...values, value];
}
```

- [ ] **Step 4: Run reducer tests**

Run: `npm test -- src/domain/gameState.test.ts`

Expected: PASS.

- [ ] **Step 5: Run all unit tests**

Run: `npm test`

Expected: PASS.

- [ ] **Step 6: Commit reducer**

Run:

```bash
git add src/domain/gameState.ts src/domain/gameState.test.ts
git commit -m "feat: add classroom game state reducer"
```

Expected: commit succeeds.

## Task 4: Render Cargo Cards, Particle Diagrams, and Drop Bins

**Files:**
- Create: `src/components/ParticleDiagram.tsx`
- Create: `src/components/CargoCard.tsx`
- Create: `src/components/DropBin.tsx`
- Create: `src/components/ParticleDiagram.test.tsx`
- Create: `src/components/CargoCard.test.tsx`
- Create: `src/components/DropBin.test.tsx`

- [ ] **Step 1: Write component tests first**

Write `src/components/ParticleDiagram.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CARGO_LIBRARY } from '../content/cargoLibrary';
import { ParticleDiagram } from './ParticleDiagram';

describe('ParticleDiagram', () => {
  it('renders atom labels and bonds for O3', () => {
    const ozone = CARGO_LIBRARY.find((item) => item.id === 'ozone-o3')!;
    render(<ParticleDiagram diagram={ozone.diagram} title="Ozone particles" />);

    expect(screen.getByRole('img', { name: /Ozone particles/i })).toBeInTheDocument();
    expect(screen.getAllByText('O')).toHaveLength(3);
  });
});
```

Write `src/components/CargoCard.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CARGO_LIBRARY } from '../content/cargoLibrary';
import { CargoCard } from './CargoCard';

describe('CargoCard', () => {
  it('shows formula, name, and damaged state', () => {
    const ozone = CARGO_LIBRARY.find((item) => item.id === 'ozone-o3')!;
    render(<CargoCard cargo={ozone} state="damaged" onSelect={vi.fn()} />);

    expect(screen.getByRole('button', { name: /Select Ozone cargo/i })).toBeInTheDocument();
    expect(screen.getByText('O3')).toBeInTheDocument();
    expect(screen.getByText(/Damaged/i)).toBeInTheDocument();
  });
});
```

Write `src/components/DropBin.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DropBin } from './DropBin';

describe('DropBin', () => {
  it('renders the nested molecule bins and submits the chosen target', async () => {
    const user = userEvent.setup();
    const onDrop = vi.fn();

    render(<DropBin kind="molecule" activeCargoName="Ozone" onDrop={onDrop} />);

    await user.click(screen.getByRole('button', { name: /Drop Ozone into Element Molecule/i }));

    expect(screen.getByText('Molecule')).toBeInTheDocument();
    expect(screen.getByText('Element Molecule')).toBeInTheDocument();
    expect(screen.getByText('Compound Molecule')).toBeInTheDocument();
    expect(onDrop).toHaveBeenCalledWith('element-molecule');
  });
});
```

- [ ] **Step 2: Run component tests and verify they fail**

Run: `npm test -- src/components/ParticleDiagram.test.tsx src/components/CargoCard.test.tsx src/components/DropBin.test.tsx`

Expected: FAIL because the components do not exist yet.

- [ ] **Step 3: Create particle diagram renderer**

Write `src/components/ParticleDiagram.tsx`:

```tsx
import type { ParticleDiagram as ParticleDiagramData } from '../domain/types';

interface ParticleDiagramProps {
  diagram: ParticleDiagramData;
  title: string;
}

export function ParticleDiagram({ diagram, title }: ParticleDiagramProps) {
  const atomById = new Map(diagram.atoms.map((atom) => [atom.id, atom]));

  return (
    <svg className="particle-diagram" viewBox="0 0 100 100" role="img" aria-label={title}>
      {diagram.bonds.map((bond) => {
        const from = atomById.get(bond.from);
        const to = atomById.get(bond.to);
        if (!from || !to) {
          return null;
        }
        return (
          <line
            key={`${bond.from}-${bond.to}`}
            className="particle-bond"
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
          />
        );
      })}
      {diagram.atoms.map((atom) => (
        <g key={atom.id}>
          <circle className="particle-atom" cx={atom.x} cy={atom.y} r="12" fill={atom.color} />
          <text className="particle-label" x={atom.x} y={atom.y + 4} textAnchor="middle">
            {atom.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
```

- [ ] **Step 4: Create cargo card**

Write `src/components/CargoCard.tsx`:

```tsx
import type { CargoItem } from '../domain/types';
import { ParticleDiagram } from './ParticleDiagram';

export type CargoCardState = 'active' | 'queued' | 'damaged' | 'repair-dock' | 'rescued';

interface CargoCardProps {
  cargo: CargoItem;
  state: CargoCardState;
  onSelect?: (cargoId: string) => void;
}

export function CargoCard({ cargo, state, onSelect }: CargoCardProps) {
  const statusLabel = state === 'damaged' ? 'Damaged' : state === 'repair-dock' ? 'Repair Dock' : undefined;

  return (
    <button
      type="button"
      className={`cargo-card cargo-card--${state}`}
      onClick={() => onSelect?.(cargo.id)}
      aria-label={`Select ${cargo.displayName} cargo`}
    >
      <ParticleDiagram diagram={cargo.diagram} title={`${cargo.displayName} particle diagram`} />
      <span className="cargo-card__name">{cargo.displayName}</span>
      {cargo.formula ? <span className="cargo-card__formula">{cargo.formula}</span> : null}
      {statusLabel ? <span className="cargo-card__status">{statusLabel}</span> : null}
    </button>
  );
}
```

- [ ] **Step 5: Create drop bin**

Write `src/components/DropBin.tsx`:

```tsx
import type { MainBinId, TargetId } from '../domain/types';

interface DropBinProps {
  kind: MainBinId;
  activeCargoName?: string;
  onDrop: (target: TargetId) => void;
}

export function DropBin({ kind, activeCargoName = 'cargo', onDrop }: DropBinProps) {
  if (kind === 'molecule') {
    return (
      <section className="drop-bin drop-bin--molecule" aria-labelledby="molecule-bin-title">
        <div className="drop-bin__heading">
          <h2 id="molecule-bin-title">Molecule</h2>
          <p>Two or more atoms bonded together</p>
        </div>
        <div className="nested-bins">
          <button
            type="button"
            className="nested-bin"
            onClick={() => onDrop('element-molecule')}
            aria-label={`Drop ${activeCargoName} into Element Molecule`}
          >
            <strong>Element Molecule</strong>
            <span>Same element bonded</span>
          </button>
          <button
            type="button"
            className="nested-bin"
            onClick={() => onDrop('compound-molecule')}
            aria-label={`Drop ${activeCargoName} into Compound Molecule`}
          >
            <strong>Compound Molecule</strong>
            <span>Different elements bonded</span>
          </button>
        </div>
      </section>
    );
  }

  const target: TargetId = kind;
  const title = kind === 'atom' ? 'Atom' : 'Mixture';
  const note = kind === 'atom' ? 'Single unbonded atom' : 'Substances together';

  return (
    <button
      type="button"
      className={`drop-bin drop-bin--${kind}`}
      onClick={() => onDrop(target)}
      aria-label={`Drop ${activeCargoName} into ${title}`}
    >
      <strong>{title}</strong>
      <span>{note}</span>
    </button>
  );
}
```

- [ ] **Step 6: Add component CSS**

Append to `src/styles.css`:

```css
.particle-diagram {
  width: min(100%, 180px);
  aspect-ratio: 1;
  overflow: visible;
}

.particle-bond {
  stroke: #334155;
  stroke-width: 5;
  stroke-linecap: round;
}

.particle-atom {
  stroke: #172033;
  stroke-width: 2;
}

.particle-label {
  fill: #172033;
  font-size: 10px;
  font-weight: 900;
  pointer-events: none;
}

.cargo-card {
  border: 2px solid #1f2937;
  border-radius: 8px;
  background: #ffffff;
  color: #111827;
  display: grid;
  gap: 8px;
  justify-items: center;
  min-height: 180px;
  padding: 12px;
  touch-action: manipulation;
  box-shadow: 0 8px 0 rgba(31, 41, 55, 0.12);
}

.cargo-card--damaged {
  border-color: #dc2626;
  background: #fff1f2;
}

.cargo-card--repair-dock {
  border-color: #b45309;
  background: #fffbeb;
}

.cargo-card__name {
  font-size: 20px;
  font-weight: 900;
  text-align: center;
}

.cargo-card__formula,
.cargo-card__status {
  border-radius: 999px;
  padding: 5px 10px;
  background: #e0f2fe;
  font-size: 15px;
  font-weight: 900;
}

.drop-bin {
  border: 3px solid #3563c7;
  border-radius: 8px;
  background: #edf4ff;
  color: #111827;
  min-height: 240px;
  padding: 16px;
  text-align: center;
  touch-action: manipulation;
}

.drop-bin--atom {
  border-color: #2f855a;
  background: #ecfdf3;
}

.drop-bin--mixture {
  border-color: #c05621;
  background: #fff7ed;
}

.drop-bin strong,
.drop-bin h2 {
  display: block;
  margin: 0;
  font-size: clamp(28px, 3.4vw, 48px);
  line-height: 1.05;
}

.drop-bin span,
.drop-bin p {
  margin: 8px 0 0;
  color: #475569;
  font-size: 18px;
  font-weight: 800;
}

.nested-bins {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.nested-bin {
  min-height: 170px;
  border: 2px dashed #3563c7;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.76);
  color: #111827;
  padding: 12px;
  touch-action: manipulation;
}

.nested-bin strong {
  font-size: clamp(22px, 2.4vw, 34px);
}

.nested-bin span {
  display: block;
  margin-top: 8px;
  color: #475569;
  font-size: 16px;
  font-weight: 800;
}
```

- [ ] **Step 7: Run component tests**

Run: `npm test -- src/components/ParticleDiagram.test.tsx src/components/CargoCard.test.tsx src/components/DropBin.test.tsx`

Expected: PASS.

- [ ] **Step 8: Commit display components**

Run:

```bash
git add src/components src/styles.css
git commit -m "feat: render cargo and sorting bins"
```

Expected: commit succeeds.

## Task 5: Build Mission Board, Teacher Controls, and App Integration

**Files:**
- Create: `src/components/TeacherControls.tsx`
- Create: `src/components/MissionBoard.tsx`
- Create: `src/components/MissionBoard.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Write Mission Board interaction tests first**

Write `src/components/MissionBoard.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { CARGO_LIBRARY } from '../content/cargoLibrary';
import { MissionBoard } from './MissionBoard';

describe('MissionBoard', () => {
  it('uses Practice Mode class check before reveal', async () => {
    const user = userEvent.setup();
    render(<MissionBoard cargoItems={CARGO_LIBRARY} initialCargoOrder={['helium', 'ozone-o3']} />);

    await user.click(screen.getByRole('button', { name: /Drop Helium into Atom/i }));

    expect(screen.getByText(/Class Check/i)).toBeInTheDocument();
    expect(screen.getByText(/Ask the class to vote/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Reveal/i }));

    expect(screen.getByText(/Helium is an atom/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Next Cargo/i }));

    expect(screen.getByText('O3')).toBeInTheDocument();
  });

  it('damages Rescue Rush cargo and then rescues it on a second try', async () => {
    const user = userEvent.setup();
    render(<MissionBoard cargoItems={CARGO_LIBRARY} initialCargoOrder={['helium', 'ozone-o3']} />);

    await user.selectOptions(screen.getByLabelText(/Mode/i), 'rescue-rush');
    await user.click(screen.getByRole('button', { name: /Drop Helium into Mixture/i }));

    expect(screen.getByText(/Damaged cargo/i)).toBeInTheDocument();
    expect(screen.getByText(/Helium needs a second try/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Drop Helium into Atom/i }));

    expect(screen.getByText(/Score: 50/i)).toBeInTheDocument();
    expect(screen.getByText('O3')).toBeInTheDocument();
  });

  it('moves cargo to repair dock after two Rescue Rush mistakes', async () => {
    const user = userEvent.setup();
    render(<MissionBoard cargoItems={CARGO_LIBRARY} initialCargoOrder={['helium', 'ozone-o3']} />);

    await user.selectOptions(screen.getByLabelText(/Mode/i), 'rescue-rush');
    await user.click(screen.getByRole('button', { name: /Drop Helium into Mixture/i }));
    await user.click(screen.getByRole('button', { name: /Drop Helium into Compound Molecule/i }));

    expect(screen.getByText(/Repair Dock/i)).toBeInTheDocument();
    expect(screen.getByText(/Helium/i)).toBeInTheDocument();
  });

  it('supports team turns', async () => {
    const user = userEvent.setup();
    render(<MissionBoard cargoItems={CARGO_LIBRARY} initialCargoOrder={['helium', 'ozone-o3']} />);

    await user.selectOptions(screen.getByLabelText(/Play style/i), 'team-turns');
    await user.click(screen.getByRole('button', { name: /Switch Team/i }));

    expect(screen.getByText(/Current Team: Beta/i)).toBeInTheDocument();
  });

  it('shows the active cargo hint from teacher controls', async () => {
    const user = userEvent.setup();
    render(<MissionBoard cargoItems={CARGO_LIBRARY} initialCargoOrder={['helium', 'ozone-o3']} />);

    await user.click(screen.getByRole('button', { name: /Hint/i }));

    expect(screen.getByText(/Look for one unbonded particle/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run Mission Board tests and verify they fail**

Run: `npm test -- src/components/MissionBoard.test.tsx`

Expected: FAIL because `MissionBoard` does not exist yet.

- [ ] **Step 3: Create TeacherControls**

Write `src/components/TeacherControls.tsx`:

```tsx
import type { GameMode, PlayStyle } from '../domain/types';

interface TeacherControlsProps {
  mode: GameMode;
  playStyle: PlayStyle;
  paused: boolean;
  canHint: boolean;
  canReveal: boolean;
  canAdvance: boolean;
  onModeChange: (mode: GameMode) => void;
  onPlayStyleChange: (playStyle: PlayStyle) => void;
  onHint: () => void;
  onReveal: () => void;
  onNext: () => void;
  onUndo: () => void;
  onPause: () => void;
  onSwitchTeam: () => void;
}

export function TeacherControls({
  mode,
  playStyle,
  paused,
  canHint,
  canReveal,
  canAdvance,
  onModeChange,
  onPlayStyleChange,
  onHint,
  onReveal,
  onNext,
  onUndo,
  onPause,
  onSwitchTeam
}: TeacherControlsProps) {
  return (
    <aside className="teacher-controls" aria-label="Teacher controls">
      <label>
        Mode
        <select value={mode} onChange={(event) => onModeChange(event.target.value as GameMode)}>
          <option value="practice">Practice Mode</option>
          <option value="rescue-rush">Rescue Rush</option>
        </select>
      </label>
      <label>
        Play style
        <select value={playStyle} onChange={(event) => onPlayStyleChange(event.target.value as PlayStyle)}>
          <option value="co-op">Co-op</option>
          <option value="team-turns">Team Turns</option>
        </select>
      </label>
      <div className="teacher-controls__buttons">
        <button type="button" onClick={onHint} disabled={!canHint}>
          Hint
        </button>
        <button type="button" onClick={onReveal} disabled={!canReveal}>
          Reveal
        </button>
        <button type="button" onClick={onNext} disabled={!canAdvance}>
          Next Cargo
        </button>
        <button type="button" onClick={onUndo}>
          Undo
        </button>
        <button type="button" onClick={onPause}>
          {paused ? 'Resume' : 'Pause'}
        </button>
        <button type="button" onClick={onSwitchTeam}>
          Switch Team
        </button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 4: Create MissionBoard**

Write `src/components/MissionBoard.tsx`:

```tsx
import { useMemo, useReducer } from 'react';
import type { CargoItem } from '../domain/types';
import { TARGET_LABELS } from '../domain/types';
import { createInitialGameState, gameReducer, getActiveCargo } from '../domain/gameState';
import { CargoCard } from './CargoCard';
import { DropBin } from './DropBin';
import { TeacherControls } from './TeacherControls';

interface MissionBoardProps {
  cargoItems: CargoItem[];
  initialCargoOrder?: string[];
}

export function MissionBoard({ cargoItems, initialCargoOrder }: MissionBoardProps) {
  const initialState = useMemo(
    () => createInitialGameState(cargoItems, { cargoOrder: initialCargoOrder }),
    [cargoItems, initialCargoOrder]
  );
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const activeCargo = getActiveCargo(state);
  const currentTeam = state.teams[state.currentTeamIndex];
  const score = state.playStyle === 'co-op'
    ? Object.values(state.scores).reduce((total, value) => total + value, 0)
    : state.scores[currentTeam];

  return (
    <section className="mission-board" aria-label="Space Cargo Sorter mission board">
      <header className="mission-topbar">
        <div>
          <p className="eyebrow">Teacher-led chemistry rescue</p>
          <h1>Space Cargo Sorter</h1>
        </div>
        <div className="score-panel">
          <span>{state.playStyle === 'team-turns' ? `Current Team: ${currentTeam}` : 'Class Co-op'}</span>
          <strong>Score: {score}</strong>
        </div>
      </header>

      <div className="mission-layout">
        <section className="cargo-panel" aria-label="Cargo queue">
          <h2>Active Cargo</h2>
          {activeCargo ? (
            <CargoCard
              cargo={activeCargo}
              state={state.damagedCargoIds.includes(activeCargo.id) ? 'damaged' : 'active'}
            />
          ) : (
            <p className="empty-state">Round complete.</p>
          )}
          <h3>Up Next</h3>
          <div className="queue-list">
            {state.cargoOrder.slice(state.activeIndex + 1, state.activeIndex + 4).map((cargoId) => {
              const cargo = cargoItems.find((item) => item.id === cargoId);
              return cargo ? <CargoCard key={cargo.id} cargo={cargo} state="queued" /> : null;
            })}
          </div>
        </section>

        <section className="sorting-board" aria-label="Rescue bays">
          <DropBin kind="atom" activeCargoName={activeCargo?.displayName} onDrop={(target) => dispatch({ type: 'drop-on-target', target })} />
          <DropBin kind="molecule" activeCargoName={activeCargo?.displayName} onDrop={(target) => dispatch({ type: 'drop-on-target', target })} />
          <DropBin kind="mixture" activeCargoName={activeCargo?.displayName} onDrop={(target) => dispatch({ type: 'drop-on-target', target })} />
        </section>

        <section className="feedback-panel" aria-label="Round feedback">
          <TeacherControls
            mode={state.mode}
            playStyle={state.playStyle}
            paused={state.paused}
            canHint={Boolean(activeCargo)}
            canReveal={state.phase === 'class-check'}
            canAdvance={state.phase === 'revealed'}
            onModeChange={(mode) => dispatch({ type: 'set-mode', mode })}
            onPlayStyleChange={(playStyle) => dispatch({ type: 'set-play-style', playStyle })}
            onHint={() => dispatch({ type: 'show-hint' })}
            onReveal={() => dispatch({ type: 'reveal' })}
            onNext={() => dispatch({ type: 'next-cargo' })}
            onUndo={() => dispatch({ type: 'undo' })}
            onPause={() => dispatch({ type: 'toggle-pause' })}
            onSwitchTeam={() => dispatch({ type: 'switch-team' })}
          />

          {activeCargo && state.hintedCargoId === activeCargo.id ? (
            <article className="feedback-card">
              <h2>Hint</h2>
              <p>{activeCargo.hint}</p>
            </article>
          ) : null}

          {state.phase === 'class-check' && state.classCheck ? (
            <article className="feedback-card">
              <h2>Class Check</h2>
              <p>Ask the class to vote or justify before revealing.</p>
              <p>Proposed: {TARGET_LABELS[state.classCheck.proposedTarget]}</p>
            </article>
          ) : null}

          {state.revealed ? (
            <article className="feedback-card feedback-card--revealed">
              <h2>{state.revealed.isCorrect ? 'Correct' : 'Review Answer'}</h2>
              <p>{state.revealed.explanation}</p>
              <p>Correct bay: {TARGET_LABELS[state.revealed.expectedTarget]}</p>
            </article>
          ) : null}

          {activeCargo && state.damagedCargoIds.includes(activeCargo.id) ? (
            <article className="feedback-card feedback-card--damaged">
              <h2>Damaged cargo</h2>
              <p>{activeCargo.displayName} needs a second try.</p>
            </article>
          ) : null}

          {state.repairDockCargoIds.length > 0 ? (
            <article className="feedback-card feedback-card--repair">
              <h2>Repair Dock</h2>
              {state.repairDockCargoIds.map((cargoId) => {
                const cargo = cargoItems.find((item) => item.id === cargoId);
                return cargo ? (
                  <div key={cargo.id}>
                    <p>{cargo.displayName}</p>
                    <button type="button" onClick={() => dispatch({ type: 'mark-repaired', cargoId: cargo.id })}>
                      Mark Repaired
                    </button>
                  </div>
                ) : null;
              })}
            </article>
          ) : null}
        </section>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Integrate board in App**

Replace `src/App.tsx` with:

```tsx
import { CARGO_LIBRARY } from './content/cargoLibrary';
import { MissionBoard } from './components/MissionBoard';

export default function App() {
  return <MissionBoard cargoItems={CARGO_LIBRARY} />;
}
```

- [ ] **Step 6: Add board layout CSS**

Append to `src/styles.css`:

```css
.mission-board {
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 18px;
}

.mission-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  border-bottom: 1px solid #d8e2ef;
  padding-bottom: 12px;
}

.mission-topbar h1 {
  font-size: clamp(32px, 4.5vw, 64px);
}

.score-panel {
  min-width: 220px;
  border: 2px solid #1f2937;
  border-radius: 8px;
  background: #ffffff;
  padding: 14px;
  text-align: right;
}

.score-panel span,
.score-panel strong {
  display: block;
  font-size: 20px;
}

.mission-layout {
  display: grid;
  grid-template-columns: minmax(220px, 0.8fr) minmax(560px, 2.2fr) minmax(260px, 0.9fr);
  gap: 18px;
  align-items: stretch;
}

.cargo-panel,
.feedback-panel,
.teacher-controls {
  border: 1px solid #d8e2ef;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  padding: 16px;
}

.cargo-panel h2,
.cargo-panel h3,
.feedback-card h2 {
  margin: 0 0 12px;
}

.queue-list {
  display: grid;
  gap: 10px;
  max-height: 42vh;
  overflow: auto;
}

.queue-list .cargo-card {
  min-height: 120px;
}

.sorting-board {
  display: grid;
  grid-template-columns: 1fr 1.7fr 1fr;
  gap: 14px;
  align-items: stretch;
}

.teacher-controls {
  display: grid;
  gap: 12px;
}

.teacher-controls label {
  display: grid;
  gap: 6px;
  color: #334155;
  font-weight: 900;
}

.teacher-controls select,
.teacher-controls button {
  min-height: 48px;
  border: 1px solid #94a3b8;
  border-radius: 8px;
  background: #ffffff;
  color: #111827;
  padding: 8px 12px;
  font-weight: 900;
}

.teacher-controls__buttons {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.feedback-panel {
  display: grid;
  gap: 12px;
  align-content: start;
}

.feedback-card {
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #f8fafc;
  padding: 14px;
}

.feedback-card--revealed {
  border-color: #2563eb;
  background: #eff6ff;
}

.feedback-card--damaged {
  border-color: #dc2626;
  background: #fff1f2;
}

.feedback-card--repair {
  border-color: #b45309;
  background: #fffbeb;
}

.empty-state {
  min-height: 180px;
  display: grid;
  place-items: center;
  border: 2px dashed #94a3b8;
  border-radius: 8px;
  color: #475569;
  font-weight: 900;
}

@media (max-width: 1100px) {
  .mission-layout {
    grid-template-columns: 1fr;
  }

  .sorting-board {
    grid-template-columns: 1fr;
  }

  .mission-topbar {
    align-items: stretch;
    flex-direction: column;
  }

  .score-panel {
    text-align: left;
  }
}
```

- [ ] **Step 7: Run Mission Board tests**

Run: `npm test -- src/components/MissionBoard.test.tsx`

Expected: PASS.

- [ ] **Step 8: Run all tests and build**

Run: `npm test`

Expected: PASS.

Run: `npm run build`

Expected: PASS.

- [ ] **Step 9: Commit board integration**

Run:

```bash
git add src/App.tsx src/components src/styles.css
git commit -m "feat: add Mission Board gameplay"
```

Expected: commit succeeds.

## Task 6: Add Browser Smoke Tests and Final Touchscreen Verification

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/mission-board.spec.ts`
- Modify: `src/styles.css`

- [ ] **Step 1: Add Playwright config**

Write `playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  webServer: {
    command: 'npm run dev -- --port 5173',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI
  },
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'large-touchscreen',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 768 } }
    },
    {
      name: 'tablet',
      use: { ...devices['iPad Pro 11'] }
    }
  ]
});
```

- [ ] **Step 2: Write Playwright tests**

Write `e2e/mission-board.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('renders classroom board with nested molecule bins', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Space Cargo Sorter' })).toBeVisible();
  await expect(page.getByText('Atom', { exact: true })).toBeVisible();
  await expect(page.getByText('Molecule', { exact: true })).toBeVisible();
  await expect(page.getByText('Element Molecule')).toBeVisible();
  await expect(page.getByText('Compound Molecule')).toBeVisible();
  await expect(page.getByText('Mixture', { exact: true })).toBeVisible();
});

test('Practice Mode reveal flow works', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: /Drop Helium into Atom/i }).click();
  await expect(page.getByText('Class Check')).toBeVisible();
  await page.getByRole('button', { name: 'Reveal' }).click();
  await expect(page.getByText(/Helium is an atom/i)).toBeVisible();
  await page.getByRole('button', { name: 'Next Cargo' }).click();
  await expect(page.getByText('Ne')).toBeVisible();
});

test('Rescue Rush damaged second try works', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Mode').selectOption('rescue-rush');
  await page.getByRole('button', { name: /Drop Helium into Mixture/i }).click();
  await expect(page.getByText('Damaged cargo')).toBeVisible();
  await page.getByRole('button', { name: /Drop Helium into Atom/i }).click();
  await expect(page.getByText('Score: 50')).toBeVisible();
});
```

- [ ] **Step 3: Run Playwright install if browsers are missing**

Run: `npx playwright install chromium`

Expected: Chromium browser is available for Playwright.

- [ ] **Step 4: Run browser smoke tests**

Run: `npm run test:e2e`

Expected: PASS for `large-touchscreen` and `tablet`.

- [ ] **Step 5: Polish any responsive layout issues found by screenshots**

If tests expose text overflow or unusable target sizing, adjust only `src/styles.css`. Keep the layout rules:

```css
.drop-bin,
.nested-bin,
.cargo-card,
.teacher-controls button,
.teacher-controls select {
  min-width: 0;
}

.cargo-card__name,
.drop-bin strong,
.nested-bin strong {
  overflow-wrap: anywhere;
}
```

Run: `npm run build && npm test && npm run test:e2e`

Expected: all checks pass.

- [ ] **Step 6: Commit browser verification**

Run:

```bash
git add playwright.config.ts e2e src/styles.css
git commit -m "test: add browser coverage for mission board"
```

Expected: commit succeeds.

## Task 7: Final Verification and Handoff

**Files:**
- Read: `docs/superpowers/specs/2026-07-02-space-cargo-sorter-design.md`
- Read: `docs/superpowers/plans/2026-07-02-space-cargo-sorter-implementation.md`
- Read: source and test files changed by prior tasks.

- [ ] **Step 1: Run full verification**

Run:

```bash
npm test
npm run build
npm run test:e2e
git diff --check
git status --short
```

Expected:

- Unit tests pass.
- Production build succeeds.
- Browser smoke tests pass.
- `git diff --check` prints no whitespace errors.
- `git status --short` is clean after the final commit.

- [ ] **Step 2: Review spec coverage**

Confirm these spec requirements are visible in the finished app:

- App name is `Space Cargo Sorter`.
- Main bins are `Atom`, `Molecule`, and `Mixture`.
- Molecule contains `Element Molecule` and `Compound Molecule`.
- Mixture is not split into homogeneous and heterogeneous bins.
- Practice Mode uses class check before reveal.
- Rescue Rush has damaged cargo and second-try rescue.
- Second wrong Rescue Rush attempt moves cargo to `Repair Dock`.
- Co-op and team turns are available.
- O3 is present and classified as `Element Molecule`.
- Standalone `NaCl` is not present as cargo.

- [ ] **Step 3: Commit final fixes if needed**

If Step 1 or Step 2 required changes, commit them:

```bash
git add src e2e package.json package-lock.json playwright.config.ts
git commit -m "fix: finish Space Cargo Sorter verification"
```

Expected: commit succeeds only when there were final fixes.

- [ ] **Step 4: Final response**

Report:

- Local dev command: `npm run dev`
- Verification commands run and their status.
- Any environment limitations, such as Playwright browser installation or network access.
- The latest commit hash.
