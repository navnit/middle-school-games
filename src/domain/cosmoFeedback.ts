import type { GameState } from './gameState';
import type { CargoItem } from './types';
import { TARGET_LABELS } from './types';

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
      detail:
        state.repairDockCargoIds.length > 0
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
      detail: 'Keep sorting, then review the Repair Dock cargo when the round slows down.'
    };
  }

  return {
    tone: 'ready',
    animation: 'idle',
    headline: 'Cosmo says: ready',
    detail: 'Sort fast, but use the evidence before you drop.'
  };
}
