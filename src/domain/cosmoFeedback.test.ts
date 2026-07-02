import { describe, expect, it } from 'vitest';
import { CARGO_LIBRARY } from '../content/cargoLibrary';
import { createInitialGameState, gameReducer, getActiveCargo } from './gameState';
import { getCosmoFeedback } from './cosmoFeedback';

const cargoOrder = ['helium', 'ozone-o3', 'water-h2o'];

function feedbackAfter(
  actions: Parameters<typeof gameReducer>[1][],
  mode: 'practice' | 'rescue-rush' = 'practice'
) {
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
