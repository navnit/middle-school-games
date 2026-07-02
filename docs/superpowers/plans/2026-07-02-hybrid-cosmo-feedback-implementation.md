# Hybrid Cosmo Feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved hybrid layout where Practice Mode is evidence-led, Rescue Rush is more game-like, and Cosmo becomes an animated feedback and hint coach.

**Architecture:** Add a pure state-to-Cosmo-feedback helper, replace the current small `RescueMascot` surface with a larger `CosmoCoach`, introduce a compact `CargoBelt` for Rescue Rush, then wire mode-specific layout classes through `MissionBoard`. CSS owns the animation using state classes and `prefers-reduced-motion`; no animation library or new game engine is needed.

**Tech Stack:** React, TypeScript, Vite, Vitest, Testing Library, Playwright, plain CSS animations.

---

## Source Spec

Use `docs/superpowers/specs/2026-07-02-hybrid-cosmo-feedback-design.md` as the source of truth.

## File Structure

- Create `src/domain/cosmoFeedback.ts`: derives Cosmo tone, headline, detail, and animation state from existing `GameState` and active cargo.
- Create `src/domain/cosmoFeedback.test.ts`: pure coverage for Practice, Rescue Rush, hint, warning, repair, paused, and complete copy.
- Create `src/components/CosmoCoach.tsx`: large animated Cosmo avatar plus communication panel.
- Create `src/components/CosmoCoach.test.tsx`: component rendering and class coverage.
- Create `src/components/CargoBelt.tsx`: compact upcoming-cargo strip for Rescue Rush.
- Create `src/components/CargoBelt.test.tsx`: queue rendering coverage.
- Modify `src/components/TeacherControls.tsx`: add a mode-specific guidance label for the command dock.
- Create `src/components/TeacherControls.test.tsx`: command guidance rendering coverage.
- Modify `src/components/MissionBoard.tsx`: replace `RescueMascot`, add `CosmoCoach`, add Rescue Rush board cargo, add cargo belt, and pass command guidance.
- Modify `src/styles.css`: add hybrid mode layout, Cosmo coach sizing, animation keyframes, command dock, cargo belt, and responsive no-scroll safeguards.
- Modify `src/components/MissionBoard.test.tsx`: update expectations from rescue mascot to Cosmo coach and add hybrid behavior checks.
- Modify `e2e/mission-board.spec.ts`: update viewport checks and add browser checks for prominent Cosmo, active rescue cargo placement, animation stability, and reduced motion.
- Delete `src/components/RescueMascot.tsx` after `MissionBoard` no longer imports it.

## Task 1: Pure Cosmo Feedback Model

**Files:**
- Create: `src/domain/cosmoFeedback.ts`
- Create: `src/domain/cosmoFeedback.test.ts`

- [ ] **Step 1: Write the failing Cosmo feedback tests**

Create `src/domain/cosmoFeedback.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { CARGO_LIBRARY } from '../content/cargoLibrary';
import { createInitialGameState, gameReducer, getActiveCargo } from './gameState';
import { getCosmoFeedback } from './cosmoFeedback';

const cargoOrder = ['helium', 'ozone-o3', 'water-h2o'];

function feedbackAfter(actions: Parameters<typeof gameReducer>[1][], mode: 'practice' | 'rescue-rush' = 'practice') {
  let state = createInitialGameState(CARGO_LIBRARY, { cargoOrder, mode });

  for (const action of actions) {
    state = gameReducer(state, action);
  }

  return getCosmoFeedback(state, getActiveCargo(state));
}

describe('getCosmoFeedback', () => {
  it('asks for evidence in initial Practice Mode', () => {
    const feedback = feedbackAfter([]);

    expect(feedback).toMatchObject({
      tone: 'practice',
      animation: 'idle',
      headline: 'Cosmo is listening for evidence'
    });
    expect(feedback.detail).toContain('single unbonded atom');
  });

  it('uses the active cargo hint when the teacher asks for a hint', () => {
    const feedback = feedbackAfter([{ type: 'show-hint' }]);

    expect(feedback.tone).toBe('hint');
    expect(feedback.animation).toBe('pulse');
    expect(feedback.headline).toBe('Cosmo hint');
    expect(feedback.detail).toContain('Look for one unbonded particle');
  });

  it('prompts class evidence during class-check', () => {
    const feedback = feedbackAfter([{ type: 'drop-on-target', target: 'atom' }]);

    expect(feedback.tone).toBe('class-check');
    expect(feedback.animation).toBe('listen');
    expect(feedback.headline).toBe('Ask the class for evidence');
    expect(feedback.detail).toContain('Proposed bay: Atom');
  });

  it('celebrates a correct reveal and reviews a wrong reveal', () => {
    const correct = feedbackAfter([
      { type: 'drop-on-target', target: 'atom' },
      { type: 'reveal' }
    ]);
    const review = feedbackAfter([
      { type: 'drop-on-target', target: 'mixture' },
      { type: 'reveal' }
    ]);

    expect(correct.tone).toBe('success');
    expect(correct.animation).toBe('bounce');
    expect(correct.detail).toContain('Helium is an atom');
    expect(review.tone).toBe('repair');
    expect(review.animation).toBe('pulse');
    expect(review.headline).toBe('Review the evidence');
  });

  it('shows Rescue Rush ready, warning, repair, and complete feedback', () => {
    const ready = feedbackAfter([], 'rescue-rush');
    const damaged = feedbackAfter([{ type: 'drop-on-target', target: 'mixture' }], 'rescue-rush');
    const repair = feedbackAfter(
      [
        { type: 'drop-on-target', target: 'mixture' },
        { type: 'drop-on-target', target: 'compound-molecule' }
      ],
      'rescue-rush'
    );
    const complete = feedbackAfter(
      [
        { type: 'drop-on-target', target: 'atom' },
        { type: 'drop-on-target', target: 'element-molecule' },
        { type: 'drop-on-target', target: 'compound-molecule' }
      ],
      'rescue-rush'
    );

    expect(ready).toMatchObject({ tone: 'ready', animation: 'idle' });
    expect(damaged).toMatchObject({ tone: 'warning', animation: 'shake' });
    expect(damaged.detail).toContain('Try one more bay');
    expect(repair).toMatchObject({ tone: 'repair', animation: 'pulse' });
    expect(repair.detail).toContain('Repair Dock');
    expect(complete).toMatchObject({ tone: 'complete', animation: 'bounce' });
  });

  it('pauses animation and copy while paused', () => {
    const feedback = feedbackAfter([{ type: 'toggle-pause' }], 'rescue-rush');

    expect(feedback).toMatchObject({
      tone: 'paused',
      animation: 'still',
      headline: 'Cosmo says: paused'
    });
  });
});
```

- [ ] **Step 2: Run the new test and verify it fails**

Run: `npm test -- src/domain/cosmoFeedback.test.ts`

Expected: FAIL with an import error for `./cosmoFeedback`.

- [ ] **Step 3: Implement the pure Cosmo feedback helper**

Create `src/domain/cosmoFeedback.ts`:

```ts
import type { CargoItem } from './types';
import { TARGET_LABELS } from './types';
import type { GameState } from './gameState';

export type CosmoTone =
  | 'ready'
  | 'practice'
  | 'hint'
  | 'class-check'
  | 'success'
  | 'warning'
  | 'repair'
  | 'paused'
  | 'complete';

export type CosmoAnimation = 'idle' | 'listen' | 'pulse' | 'bounce' | 'shake' | 'still';

export interface CosmoFeedback {
  tone: CosmoTone;
  animation: CosmoAnimation;
  headline: string;
  detail: string;
}

export function getCosmoFeedback(state: GameState, activeCargo?: CargoItem): CosmoFeedback {
  if (state.paused) {
    return {
      tone: 'paused',
      animation: 'still',
      headline: 'Cosmo says: paused',
      detail: 'Resume when the class is ready to keep sorting.'
    };
  }

  if (state.phase === 'round-complete') {
    return {
      tone: 'complete',
      animation: 'bounce',
      headline: 'Mission complete',
      detail: state.repairDockCargoIds.length > 0
        ? 'Review the Repair Dock before wrapping up.'
        : 'Every cargo item has been handled.'
    };
  }

  if (state.mode === 'practice') {
    return getPracticeFeedback(state, activeCargo);
  }

  return getRescueRushFeedback(state, activeCargo);
}

function getPracticeFeedback(state: GameState, activeCargo?: CargoItem): CosmoFeedback {
  if (state.revealed) {
    if (state.revealed.isCorrect) {
      return {
        tone: 'success',
        animation: 'bounce',
        headline: 'Good evidence',
        detail: state.revealed.explanation
      };
    }

    return {
      tone: 'repair',
      animation: 'pulse',
      headline: 'Review the evidence',
      detail: `Correct bay: ${TARGET_LABELS[state.revealed.expectedTarget]}. ${state.revealed.explanation}`
    };
  }

  if (state.classCheck) {
    return {
      tone: 'class-check',
      animation: 'listen',
      headline: 'Ask the class for evidence',
      detail: `Proposed bay: ${TARGET_LABELS[state.classCheck.proposedTarget]}. What evidence supports or challenges that choice?`
    };
  }

  if (activeCargo && state.hintedCargoId === activeCargo.id) {
    return {
      tone: 'hint',
      animation: 'pulse',
      headline: 'Cosmo hint',
      detail: activeCargo.hint
    };
  }

  return {
    tone: 'practice',
    animation: 'idle',
    headline: 'Cosmo is listening for evidence',
    detail: 'Ask: is this a single unbonded atom, bonded atoms, or substances together?'
  };
}

function getRescueRushFeedback(state: GameState, activeCargo?: CargoItem): CosmoFeedback {
  if (state.repairDockCargoIds.length > 0 && !activeCargo) {
    return {
      tone: 'repair',
      animation: 'pulse',
      headline: 'Repair Dock review',
      detail: 'Open the Repair Dock and talk through the evidence before marking cargo repaired.'
    };
  }

  if (activeCargo && state.damagedCargoIds.includes(activeCargo.id)) {
    return {
      tone: 'warning',
      animation: 'shake',
      headline: 'Cargo damaged',
      detail: 'Try one more bay. A correct second rescue still saves this cargo.'
    };
  }

  if (activeCargo && state.hintedCargoId === activeCargo.id) {
    return {
      tone: 'hint',
      animation: 'pulse',
      headline: 'Cosmo hint',
      detail: activeCargo.hint
    };
  }

  if (state.repairDockCargoIds.length > 0) {
    return {
      tone: 'repair',
      animation: 'pulse',
      headline: 'Repair Dock waiting',
      detail: 'Keep sorting, then review the repair cargo when the round slows down.'
    };
  }

  return {
    tone: 'ready',
    animation: 'idle',
    headline: 'Cosmo says: ready',
    detail: 'Sort fast, but use the evidence before you drop.'
  };
}
```

- [ ] **Step 4: Run the Cosmo feedback tests and verify they pass**

Run: `npm test -- src/domain/cosmoFeedback.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit Task 1**

Run:

```bash
git add src/domain/cosmoFeedback.ts src/domain/cosmoFeedback.test.ts
git commit -m "feat: derive cosmo feedback from game state"
```

## Task 2: Animated Cosmo Coach Component

**Files:**
- Create: `src/components/CosmoCoach.tsx`
- Create: `src/components/CosmoCoach.test.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Write the failing component tests**

Create `src/components/CosmoCoach.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run the component test and verify it fails**

Run: `npm test -- src/components/CosmoCoach.test.tsx`

Expected: FAIL with an import error for `./CosmoCoach`.

- [ ] **Step 3: Implement `CosmoCoach` with stable animation hooks**

Create `src/components/CosmoCoach.tsx`:

```tsx
import type { CosmoFeedback } from '../domain/cosmoFeedback';

interface CosmoCoachProps {
  feedback: CosmoFeedback;
}

export function CosmoCoach({ feedback }: CosmoCoachProps) {
  return (
    <section
      className={`cosmo-coach cosmo-coach--${feedback.tone} cosmo-coach--${feedback.animation}`}
      data-cosmo-tone={feedback.tone}
      aria-label="Cosmo coach"
      aria-live="polite"
    >
      <svg className="cosmo-coach__avatar" aria-hidden="true" viewBox="0 0 128 112">
        <path className="cosmo-coach__tail" d="M31 62 C8 60 8 29 31 27 C51 25 51 55 34 56" />
        <ellipse className="cosmo-coach__body" cx="68" cy="63" rx="39" ry="33" />
        <circle className="cosmo-coach__helmet" cx="68" cy="55" r="31" />
        <circle className="cosmo-coach__face" cx="68" cy="55" r="23" />
        <circle className="cosmo-coach__eye cosmo-coach__eye--left" cx="58" cy="52" r="4" />
        <circle className="cosmo-coach__eye cosmo-coach__eye--right" cx="78" cy="52" r="4" />
        <path className="cosmo-coach__smile" d="M58 66 Q68 74 78 66" />
        <path className="cosmo-coach__antenna" d="M68 24 V9" />
        <circle className="cosmo-coach__beacon" cx="68" cy="7" r="6" />
        <path className="cosmo-coach__fin" d="M28 72 L9 91 L36 94 Z" />
        <path className="cosmo-coach__fin" d="M108 72 L127 91 L100 94 Z" />
      </svg>
      <div className="cosmo-coach__message">
        <strong>{feedback.headline}</strong>
        <span>{feedback.detail}</span>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Add base Cosmo CSS without final layout animation**

Append this block near the existing mascot styles in `src/styles.css`:

```css
.cosmo-coach {
  min-width: 0;
  min-height: 118px;
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr);
  gap: 14px;
  align-items: center;
  border: 2px solid #8fc7ff;
  border-radius: 8px;
  background: linear-gradient(180deg, #ffffff, #eef7ff);
  box-shadow: 0 12px 24px rgba(8, 38, 111, 0.18);
  padding: 10px 14px;
  color: var(--blue-dark);
}

.cosmo-coach__avatar {
  width: 104px;
  height: 92px;
  filter: drop-shadow(0 7px 10px rgba(3, 7, 18, 0.22));
}

.cosmo-coach__tail,
.cosmo-coach__antenna,
.cosmo-coach__smile {
  fill: none;
  stroke: #0b2a78;
  stroke-linecap: round;
  stroke-width: 5;
}

.cosmo-coach__tail {
  stroke: #65a9f4;
  stroke-width: 6;
}

.cosmo-coach__body {
  fill: #e0f2fe;
  stroke: #0b2a78;
  stroke-width: 5;
}

.cosmo-coach__helmet {
  fill: #ffffff;
  stroke: #38bdf8;
  stroke-width: 6;
}

.cosmo-coach__face {
  fill: #dcfce7;
}

.cosmo-coach__eye,
.cosmo-coach__beacon {
  fill: #0b2a78;
}

.cosmo-coach__fin {
  fill: #facc15;
  stroke: #0b2a78;
  stroke-linejoin: round;
  stroke-width: 4;
}

.cosmo-coach__message {
  min-width: 0;
  display: grid;
  gap: 6px;
}

.cosmo-coach__message strong {
  color: var(--blue-dark);
  font-size: clamp(18px, 1.7vw, 25px);
  line-height: 1.05;
}

.cosmo-coach__message span {
  color: #263d67;
  font-size: clamp(13px, 1vw, 17px);
  font-weight: 800;
  line-height: 1.25;
}

.cosmo-coach--warning {
  border-color: #f97316;
  background: linear-gradient(180deg, #fff7ed, #ffffff);
}

.cosmo-coach--success,
.cosmo-coach--complete {
  border-color: #22c55e;
  background: linear-gradient(180deg, #ecfdf3, #ffffff);
}

.cosmo-coach--hint,
.cosmo-coach--class-check {
  border-color: #a78bfa;
  background: linear-gradient(180deg, #f5f3ff, #ffffff);
}
```

- [ ] **Step 5: Run component tests**

Run: `npm test -- src/components/CosmoCoach.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit Task 2**

Run:

```bash
git add src/components/CosmoCoach.tsx src/components/CosmoCoach.test.tsx src/styles.css
git commit -m "feat: add animated cosmo coach surface"
```

## Task 3: Cargo Belt And Command Dock API

**Files:**
- Create: `src/components/CargoBelt.tsx`
- Create: `src/components/CargoBelt.test.tsx`
- Create: `src/components/TeacherControls.test.tsx`
- Modify: `src/components/TeacherControls.tsx`

- [ ] **Step 1: Write failing cargo belt and command guidance tests**

Create `src/components/CargoBelt.test.tsx`:

```tsx
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CARGO_LIBRARY } from '../content/cargoLibrary';
import { CargoBelt } from './CargoBelt';

const cargoItems = CARGO_LIBRARY.filter((cargo) =>
  ['neon', 'argon', 'carbon-atom'].includes(cargo.id)
);

describe('CargoBelt', () => {
  it('renders upcoming cargo as a compact belt', () => {
    render(<CargoBelt cargoItems={cargoItems} />);

    const belt = screen.getByRole('region', { name: /Cargo belt/i });
    expect(within(belt).getByLabelText(/Neon cargo/i)).toBeInTheDocument();
    expect(within(belt).getByLabelText(/Argon cargo/i)).toBeInTheDocument();
    expect(within(belt).getByLabelText(/Carbon atom cargo/i)).toBeInTheDocument();
  });

  it('shows an empty state when there is no upcoming cargo', () => {
    render(<CargoBelt cargoItems={[]} />);

    expect(screen.getByText(/Cargo belt clear/i)).toBeInTheDocument();
  });
});
```

Create `src/components/TeacherControls.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TeacherControls } from './TeacherControls';

const handlers = {
  onModeChange: vi.fn(),
  onPlayStyleChange: vi.fn(),
  onHint: vi.fn(),
  onReveal: vi.fn(),
  onNext: vi.fn(),
  onUndo: vi.fn(),
  onPause: vi.fn(),
  onSwitchTeam: vi.fn()
};

describe('TeacherControls', () => {
  it('renders the command guidance label', () => {
    render(
      <TeacherControls
        mode="practice"
        playStyle="co-op"
        paused={false}
        canHint
        canReveal={false}
        canAdvance={false}
        canUndo={false}
        guidanceLabel="Ask For Evidence"
        {...handlers}
      />
    );

    expect(screen.getByText('Ask For Evidence')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hint' })).toBeEnabled();
  });
});
```

- [ ] **Step 2: Run the focused tests and verify they fail**

Run: `npm test -- src/components/CargoBelt.test.tsx src/components/TeacherControls.test.tsx`

Expected: FAIL because `CargoBelt` does not exist and `TeacherControls` does not accept `guidanceLabel`.

- [ ] **Step 3: Implement `CargoBelt`**

Create `src/components/CargoBelt.tsx`:

```tsx
import type { CargoItem } from '../domain/types';
import { CargoCard } from './CargoCard';

interface CargoBeltProps {
  cargoItems: CargoItem[];
}

export function CargoBelt({ cargoItems }: CargoBeltProps) {
  return (
    <section className="cargo-belt" aria-label="Cargo belt">
      {cargoItems.length > 0 ? (
        cargoItems.map((cargo) => <CargoCard key={cargo.id} cargo={cargo} state="queued" />)
      ) : (
        <p className="empty-state empty-state--compact">Cargo belt clear.</p>
      )}
    </section>
  );
}
```

- [ ] **Step 4: Add command guidance support to `TeacherControls`**

Modify `src/components/TeacherControls.tsx`:

```tsx
interface TeacherControlsProps {
  mode: GameMode;
  playStyle: PlayStyle;
  paused: boolean;
  canHint: boolean;
  canReveal: boolean;
  canAdvance: boolean;
  canUndo: boolean;
  guidanceLabel: string;
  onModeChange: (mode: GameMode) => void;
  onPlayStyleChange: (playStyle: PlayStyle) => void;
  onHint: () => void;
  onReveal: () => void;
  onNext: () => void;
  onUndo: () => void;
  onPause: () => void;
  onSwitchTeam: () => void;
}
```

Add `guidanceLabel` to the destructuring parameter list. Render this immediately after the select controls and before the buttons:

```tsx
<strong className="teacher-controls__guidance">{guidanceLabel}</strong>
```

- [ ] **Step 5: Run focused tests**

Run: `npm test -- src/components/CargoBelt.test.tsx src/components/TeacherControls.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit Task 3**

Run:

```bash
git add src/components/CargoBelt.tsx src/components/CargoBelt.test.tsx src/components/TeacherControls.tsx src/components/TeacherControls.test.tsx
git commit -m "feat: add cargo belt and command guidance"
```

## Task 4: Mission Board Hybrid Wiring

**Files:**
- Modify: `src/components/MissionBoard.tsx`
- Modify: `src/components/MissionBoard.test.tsx`
- Delete: `src/components/RescueMascot.tsx`

- [ ] **Step 1: Add failing Mission Board tests for hybrid layout**

Modify `src/components/MissionBoard.test.tsx`:

Add this test:

```tsx
it('shows the Practice Mode evidence command and Cosmo guidance', () => {
  render(<MissionBoard cargoItems={CARGO_LIBRARY} initialCargoOrder={initialCargoOrder} />);

  expect(screen.getByText(/Ask For Evidence/i)).toBeInTheDocument();
  expect(screen.getByRole('region', { name: /Cosmo coach/i })).toHaveTextContent(
    /Cosmo is listening for evidence/i
  );
});
```

Replace the existing test named `shows the Rescue Rush mascot, clock, and progress HUD` with:

```tsx
it('shows Cosmo coach, clock, and progress HUD in Rescue Rush', async () => {
  const user = userEvent.setup();
  render(<MissionBoard cargoItems={CARGO_LIBRARY} initialCargoOrder={initialCargoOrder} />);

  await user.selectOptions(screen.getByLabelText(/Mode/i), 'rescue-rush');

  expect(screen.getByLabelText(/Mission clock/i)).toHaveTextContent('01:30');
  expect(screen.getByRole('region', { name: /Cosmo coach/i })).toHaveTextContent(/Cosmo says: ready/i);
  expect(screen.getByRole('region', { name: /Cargo belt/i })).toBeInTheDocument();
  expect(screen.getByText(/Saved 0\/2/i)).toBeInTheDocument();
  expect(screen.getByText(/Damaged 0/i)).toBeInTheDocument();
  expect(screen.getByText(/Repair Dock 0/i)).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: /Drop Helium into Mixture/i }));

  expect(screen.getByRole('region', { name: /Cosmo coach/i })).toHaveTextContent(/Cargo damaged/i);
  expect(screen.getByRole('region', { name: /Cosmo coach/i })).toHaveAttribute(
    'data-cosmo-tone',
    'warning'
  );
  expect(screen.getByText(/Damaged 1/i)).toBeInTheDocument();
});
```

Add this test:

```tsx
it('places active cargo inside the Rescue Rush board', async () => {
  const user = userEvent.setup();
  render(<MissionBoard cargoItems={CARGO_LIBRARY} initialCargoOrder={initialCargoOrder} />);

  await user.selectOptions(screen.getByLabelText(/Mode/i), 'rescue-rush');

  const rescueBoard = screen.getByRole('region', { name: /Rescue bays/i });
  expect(within(rescueBoard).getByLabelText(/Helium cargo/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run Mission Board tests and verify they fail**

Run: `npm test -- src/components/MissionBoard.test.tsx`

Expected: FAIL because `MissionBoard` still renders `RescueMascot`, does not pass `guidanceLabel`, and does not render active cargo inside the rescue board.

- [ ] **Step 3: Wire Cosmo feedback and mode classes in `MissionBoard`**

Modify imports in `src/components/MissionBoard.tsx`:

```tsx
import { getCosmoFeedback } from '../domain/cosmoFeedback';
import { CargoBelt } from './CargoBelt';
import { CosmoCoach } from './CosmoCoach';
```

Remove:

```tsx
import { RescueMascot } from './RescueMascot';
```

Delete the local `getRescueMascotTone` and `getRescueMascotMessage` functions.

Inside the component body, add:

```tsx
const isRescueRush = state.mode === 'rescue-rush';
const cosmoFeedback = getCosmoFeedback(state, activeCargo);
const guidanceLabel = isRescueRush ? 'Rescue Commands' : 'Ask For Evidence';
```

Change the main class:

```tsx
className={`mission-board mission-board--${state.mode}${draggingCargoId ? ' mission-board--dragging' : ''}`}
```

- [ ] **Step 4: Render Practice cargo panel and Rescue Rush cargo belt separately**

In the cargo panel, keep the existing active `CargoCard` only for Practice Mode:

```tsx
{activeCargo && !isRescueRush ? (
  <CargoCard
    cargo={activeCargo}
    state={state.damagedCargoIds.includes(activeCargo.id) ? 'damaged' : 'active'}
    isDraggable={isActiveCargoDraggable}
    isDragging={draggingCargoId === activeCargo.id}
    onCargoDragStart={handleCargoDragStart}
    onCargoDragEnd={clearDragState}
    onCargoPointerDragStart={handleCargoPointerDragStart}
  />
) : isRescueRush ? (
  <CargoBelt cargoItems={queuedCargo} />
) : (
  <p className="empty-state">Round complete.</p>
)}
```

Keep the existing `queue-panel` only for Practice Mode:

```tsx
{!isRescueRush ? (
  <div className="queue-panel" aria-label="Upcoming cargo">
    <h3>Up Next</h3>
    <div className="queue-list">
      {queuedCargo.length > 0 ? (
        queuedCargo.map((cargo) => <CargoCard key={cargo.id} cargo={cargo} state="queued" />)
      ) : (
        <p className="empty-state empty-state--compact">No more cargo queued.</p>
      )}
    </div>
  </div>
) : null}
```

- [ ] **Step 5: Replace `RescueMascot` with `CosmoCoach` and add board cargo**

Inside the sorting board section, replace:

```tsx
<RescueMascot message={mascotMessage} tone={mascotTone} />
```

with:

```tsx
<CosmoCoach feedback={cosmoFeedback} />
{activeCargo && isRescueRush ? (
  <div className="sorting-board__active-cargo">
    <CargoCard
      cargo={activeCargo}
      state={state.damagedCargoIds.includes(activeCargo.id) ? 'damaged' : 'active'}
      isDraggable={isActiveCargoDraggable}
      isDragging={draggingCargoId === activeCargo.id}
      onCargoDragStart={handleCargoDragStart}
      onCargoDragEnd={clearDragState}
      onCargoPointerDragStart={handleCargoPointerDragStart}
    />
  </div>
) : null}
```

- [ ] **Step 6: Pass the command guidance label**

Update the `TeacherControls` call:

```tsx
<TeacherControls
  mode={state.mode}
  playStyle={state.playStyle}
  paused={state.paused}
  canHint={Boolean(activeCargo)}
  canReveal={state.phase === 'class-check'}
  canAdvance={state.phase === 'revealed'}
  canUndo={state.history.length > 0}
  guidanceLabel={guidanceLabel}
  onModeChange={(mode) => dispatch({ type: 'set-mode', mode })}
  onPlayStyleChange={(playStyle) => dispatch({ type: 'set-play-style', playStyle })}
  onHint={() => dispatch({ type: 'show-hint' })}
  onReveal={() => dispatch({ type: 'reveal' })}
  onNext={() => dispatch({ type: 'next-cargo' })}
  onUndo={() => dispatch({ type: 'undo' })}
  onPause={() => dispatch({ type: 'toggle-pause' })}
  onSwitchTeam={() => dispatch({ type: 'switch-team' })}
/>
```

- [ ] **Step 7: Remove the old mascot file**

Run: `rg "RescueMascot|rescue-mascot" src`

Expected: no TypeScript imports of `RescueMascot` remain after Step 5. CSS references to `.rescue-mascot` can remain until Task 5 removes or replaces them.

Delete `src/components/RescueMascot.tsx`.

- [ ] **Step 8: Run Mission Board tests**

Run: `npm test -- src/components/MissionBoard.test.tsx`

Expected: PASS.

- [ ] **Step 9: Commit Task 4**

Run:

```bash
git add src/components/MissionBoard.tsx src/components/MissionBoard.test.tsx src/components/RescueMascot.tsx
git commit -m "feat: wire hybrid cosmo mission board"
```

## Task 5: Hybrid Layout And Cosmo Animation CSS

**Files:**
- Modify: `src/styles.css`
- Modify: `e2e/mission-board.spec.ts`

- [ ] **Step 1: Add failing e2e layout and animation checks**

Modify `e2e/mission-board.spec.ts`.

Update the Rescue Rush mascot expectation:

```ts
await expect(page.getByRole('region', { name: 'Cosmo coach' })).toBeVisible();
```

Replace the `keeps rescue bins compact with a prominent mascot` test with:

```ts
test('keeps rescue bins compact with a prominent animated Cosmo coach', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Mode').selectOption('rescue-rush');

  const metrics = await page.evaluate(() => {
    const readBox = (selector: string) => {
      const element = document.querySelector(selector);
      if (!element) {
        throw new Error(`Missing ${selector}`);
      }
      const rect = element.getBoundingClientRect();
      return {
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left,
        right: rect.right,
        width: rect.width,
        height: rect.height
      };
    };

    return {
      board: readBox('.sorting-board'),
      cosmo: readBox('.cosmo-coach'),
      boardCargo: readBox('.sorting-board__active-cargo'),
      atom: readBox('.drop-bin--atom'),
      molecule: readBox('.drop-bin--molecule'),
      mixture: readBox('.drop-bin--mixture')
    };
  });

  const maxBinHeight = metrics.board.height * 0.55;
  expect(metrics.cosmo.height).toBeGreaterThanOrEqual(92);
  expect(metrics.cosmo.width).toBeGreaterThanOrEqual(220);
  expect(metrics.boardCargo.top).toBeGreaterThanOrEqual(metrics.cosmo.bottom - 4);
  expect(metrics.atom.height).toBeLessThanOrEqual(maxBinHeight);
  expect(metrics.molecule.height).toBeLessThanOrEqual(maxBinHeight);
  expect(metrics.mixture.height).toBeLessThanOrEqual(maxBinHeight);
});
```

Add this test:

```ts
test('Cosmo warning animation does not shift board layout', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Mode').selectOption('rescue-rush');

  const before = await page.locator('.cosmo-coach').boundingBox();
  await page.getByRole('button', { name: 'Drop Helium into Mixture' }).click();
  await expect(page.getByRole('region', { name: 'Cosmo coach' })).toHaveText(/Cargo damaged/i);
  const after = await page.locator('.cosmo-coach').boundingBox();

  expect(before).not.toBeNull();
  expect(after).not.toBeNull();
  expect(Math.abs(after!.width - before!.width)).toBeLessThanOrEqual(2);
  expect(Math.abs(after!.height - before!.height)).toBeLessThanOrEqual(18);
});
```

Add this test:

```ts
test('Cosmo respects reduced motion preference', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByLabel('Mode').selectOption('rescue-rush');

  const animationName = await page
    .locator('.cosmo-coach__avatar')
    .evaluate((element) => getComputedStyle(element).animationName);

  expect(animationName).toBe('none');
});
```

- [ ] **Step 2: Run e2e focused tests and verify they fail**

Run: `npm run test:e2e -- -g "Cosmo|compact with a prominent animated"`

Expected: FAIL until CSS layout and animation are complete.

- [ ] **Step 3: Replace old mascot CSS with Cosmo coach placement and animation**

In `src/styles.css`, remove or stop using `.rescue-mascot`, `.rescue-mascot__*`, and `.rescue-mascot--*` selectors. Add these animation keyframes and state selectors near the Cosmo styles:

```css
@keyframes cosmo-idle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

@keyframes cosmo-listen {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(-2deg); }
}

@keyframes cosmo-pulse {
  0%, 100% { box-shadow: 0 12px 24px rgba(8, 38, 111, 0.18); }
  50% { box-shadow: 0 0 0 5px rgba(167, 139, 250, 0.24), 0 14px 28px rgba(8, 38, 111, 0.2); }
}

@keyframes cosmo-bounce {
  0%, 100% { transform: translateY(0) scale(1); }
  35% { transform: translateY(-8px) scale(1.03); }
  70% { transform: translateY(1px) scale(0.99); }
}

@keyframes cosmo-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  50% { transform: translateX(4px); }
  75% { transform: translateX(-2px); }
}

@keyframes cosmo-beacon {
  0%, 100% { fill: #0b2a78; }
  50% { fill: #f97316; }
}

.cosmo-coach--idle .cosmo-coach__avatar {
  animation: cosmo-idle 3.2s ease-in-out infinite;
}

.cosmo-coach--listen .cosmo-coach__avatar {
  animation: cosmo-listen 2.4s ease-in-out infinite;
  transform-origin: 50% 70%;
}

.cosmo-coach--pulse {
  animation: cosmo-pulse 1.35s ease-in-out infinite;
}

.cosmo-coach--bounce .cosmo-coach__avatar {
  animation: cosmo-bounce 780ms ease-out 1;
}

.cosmo-coach--shake .cosmo-coach__avatar {
  animation: cosmo-shake 520ms ease-in-out 1;
}

.cosmo-coach--warning .cosmo-coach__beacon,
.cosmo-coach--repair .cosmo-coach__beacon {
  animation: cosmo-beacon 950ms ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .cosmo-coach,
  .cosmo-coach *,
  .cosmo-coach::before,
  .cosmo-coach::after {
    animation: none !important;
    transition: none !important;
  }
}
```

- [ ] **Step 4: Add hybrid board and cargo belt layout CSS**

Add or update these selectors in `src/styles.css`:

```css
.mission-board--rescue-rush .cargo-panel {
  grid-template-rows: auto minmax(0, 1fr);
}

.cargo-belt {
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  align-content: stretch;
}

.cargo-belt .cargo-card {
  min-height: 0;
  box-shadow: none;
}

.sorting-board {
  grid-template-rows: auto minmax(0, 0.58fr) minmax(0, 1fr);
  align-items: stretch;
}

.sorting-board::before {
  content: none;
}

.sorting-board > * {
  position: relative;
}

.sorting-board .cosmo-coach {
  grid-column: 1 / -1;
  z-index: 4;
}

.sorting-board__active-cargo {
  grid-column: 1 / -1;
  z-index: 3;
  width: min(260px, 42%);
  justify-self: center;
  align-self: center;
}

.sorting-board__active-cargo .cargo-card {
  min-height: 112px;
  box-shadow: 0 14px 24px rgba(8, 38, 111, 0.18);
}

.teacher-controls__guidance {
  min-height: 44px;
  display: grid;
  align-content: center;
  border: 1px solid #b9d5f4;
  border-radius: 8px;
  background: #f8fbff;
  color: var(--blue-dark);
  padding: 6px 8px;
  text-align: center;
  font-size: 14px;
  font-weight: 900;
}
```

Adjust existing responsive rules so the in-app browser viewport keeps these constraints:

```css
@media (max-width: 720px) {
  .cosmo-coach {
    min-height: 82px;
    grid-template-columns: 72px minmax(0, 1fr);
    gap: 8px;
    padding: 6px 8px;
  }

  .cosmo-coach__avatar {
    width: 68px;
    height: 60px;
  }

  .cosmo-coach__message strong {
    font-size: 12px;
  }

  .cosmo-coach__message span {
    font-size: 10px;
    line-height: 1.15;
  }

  .sorting-board__active-cargo {
    width: min(176px, 60%);
  }

  .sorting-board__active-cargo .cargo-card {
    min-height: 76px;
  }

  .cargo-belt {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 5px;
  }
}
```

- [ ] **Step 5: Run focused e2e tests**

Run: `npm run test:e2e -- -g "Cosmo|compact with a prominent animated"`

Expected: PASS.

- [ ] **Step 6: Run unit tests**

Run: `npm test`

Expected: PASS.

- [ ] **Step 7: Commit Task 5**

Run:

```bash
git add src/styles.css e2e/mission-board.spec.ts
git commit -m "feat: animate cosmo and rebalance hybrid layout"
```

## Task 6: Final Verification, Browser QA, And Publish

**Files:**
- Modify only files required by test fixes found in this task.

- [ ] **Step 1: Run full verification**

Run:

```bash
npm test
npm run build
npm run test:e2e
git diff --check
```

Expected:

- Vitest passes all unit/component tests.
- Vite production build completes.
- Playwright passes all browser tests.
- `git diff --check` prints no whitespace errors.

- [ ] **Step 2: Start the local app for visual QA**

Run: `npm run dev -- --port 5175`

Open `http://127.0.0.1:5175/` in the in-app browser.

- [ ] **Step 3: Manual QA Practice Mode**

Check:

- Cosmo is prominent before any drop.
- Cosmo asks for evidence.
- `Ask For Evidence` appears in the command dock.
- Clicking `Hint` changes Cosmo to hint tone and message.
- Dropping Helium into Atom changes Cosmo to class-check tone.
- Reveal changes Cosmo to success or review tone.
- No page scroll appears.

- [ ] **Step 4: Manual QA Rescue Rush**

Check:

- Active cargo appears inside or immediately above the rescue board.
- Upcoming cargo appears as a compact belt.
- Cosmo gently idles.
- Wrong drop triggers warning tone and warning animation without shifting bins.
- Second correct drop rescues cargo.
- Reduced-motion mode removes continuous Cosmo animation if tested through browser media emulation.

- [ ] **Step 5: Commit any final fixes**

If manual QA required changes:

```bash
git add src e2e
git commit -m "fix: polish hybrid cosmo classroom layout"
```

Skip this step if no final fixes were needed.

- [ ] **Step 6: Push to GitHub Pages**

Run:

```bash
git push origin HEAD:main
gh run list --repo navnit/middle-school-games --limit 3 --json databaseId,name,status,conclusion,headBranch,url,createdAt,headSha
RUN_ID="$(gh run list --repo navnit/middle-school-games --limit 1 --json databaseId --jq '.[0].databaseId')"
gh run watch "$RUN_ID" --repo navnit/middle-school-games --exit-status
```

Expected: Pages deployment completes successfully.

- [ ] **Step 7: Verify live Pages**

Open `https://navnit.me/middle-school-games/`.

Check:

- Practice Mode shows the new Cosmo coach and evidence prompt.
- Rescue Rush shows active cargo in the board, compact cargo belt, timer, and animated Cosmo warning on wrong drop.
- No page scroll or text overflow appears in the in-app browser viewport.
