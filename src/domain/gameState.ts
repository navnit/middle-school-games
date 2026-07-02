import { validateDrop } from './classification';
import type { CargoItem, GameMode, PlayStyle, TargetId, ValidationResult } from './types';

export type GamePhase = 'ready' | 'class-check' | 'revealed' | 'round-complete';

export const RESCUE_RUSH_SECONDS = 90;

export interface ClassCheckState {
  cargoId: string;
  proposedTarget: TargetId;
  result: ValidationResult;
}

type GameSnapshot = Omit<GameState, 'history'>;

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
  rescueRushSecondsRemaining: number;
  hintedCargoId?: string;
  classCheck?: ClassCheckState;
  revealed?: ValidationResult;
  history: GameSnapshot[];
}

export type GameAction =
  | { type: 'drop-on-target'; target: TargetId }
  | { type: 'reveal' }
  | { type: 'next-cargo' }
  | { type: 'mark-repaired'; cargoId: string }
  | { type: 'show-hint' }
  | { type: 'tick-rescue-timer' }
  | { type: 'toggle-pause' }
  | { type: 'set-mode'; mode: GameMode }
  | { type: 'set-play-style'; playStyle: PlayStyle }
  | { type: 'switch-team' }
  | { type: 'undo' }
  | { type: 'reset' };

export interface InitialGameStateOptions {
  cargoOrder?: string[];
  mode?: GameMode;
  playStyle?: PlayStyle;
  teams?: string[];
}

const DEFAULT_TEAMS = ['Alpha', 'Beta'];

export function createInitialGameState(
  cargoItems: CargoItem[],
  options: InitialGameStateOptions = {}
): GameState {
  const cargoOrder = options.cargoOrder ? [...options.cargoOrder] : cargoItems.map((item) => item.id);
  const teams = options.teams && options.teams.length > 0 ? [...options.teams] : [...DEFAULT_TEAMS];
  const activeCargoId = cargoOrder.length > 0 ? cargoOrder[0] : undefined;

  return {
    cargoItems,
    cargoOrder,
    activeCargoId,
    activeIndex: activeCargoId ? 0 : cargoOrder.length,
    mode: options.mode ?? 'practice',
    playStyle: options.playStyle ?? 'co-op',
    phase: activeCargoId ? 'ready' : 'round-complete',
    paused: false,
    teams,
    currentTeamIndex: 0,
    scores: createScoreRecord(teams),
    attemptsByCargoId: {},
    rescuedCargoIds: [],
    damagedCargoIds: [],
    repairDockCargoIds: [],
    rescueRushSecondsRemaining: RESCUE_RUSH_SECONDS,
    hintedCargoId: undefined,
    classCheck: undefined,
    revealed: undefined,
    history: []
  };
}

export function getActiveCargo(state: GameState): CargoItem | undefined {
  return state.cargoItems.find((item) => item.id === state.activeCargoId);
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (action.type === 'undo') {
    const previousIndex = state.history.length - 1;
    const previous = state.history[previousIndex];
    return previous ? { ...previous, history: state.history.slice(0, previousIndex) } : state;
  }

  if (action.type === 'reset') {
    return createInitialGameState(state.cargoItems, {
      cargoOrder: state.cargoOrder,
      mode: state.mode,
      playStyle: state.playStyle,
      teams: state.teams
    });
  }

  if (action.type === 'toggle-pause') {
    return withHistory(state, { ...state, paused: !state.paused });
  }

  if (state.paused) {
    return state;
  }

  switch (action.type) {
    case 'set-mode':
      return withHistory(
        state,
        createInitialGameState(state.cargoItems, {
          cargoOrder: state.cargoOrder,
          mode: action.mode,
          playStyle: state.playStyle,
          teams: state.teams
        })
      );
    case 'set-play-style':
      return withHistory(state, {
        ...state,
        playStyle: action.playStyle,
        currentTeamIndex: action.playStyle === 'team-turns' ? state.currentTeamIndex : 0
      });
    case 'switch-team':
      return withHistory(state, {
        ...state,
        currentTeamIndex: (state.currentTeamIndex + 1) % state.teams.length
      });
    case 'show-hint':
      return handleShowHint(state);
    case 'tick-rescue-timer':
      return handleRescueTimerTick(state);
    case 'drop-on-target':
      return handleDrop(state, action.target);
    case 'reveal':
      return handleReveal(state);
    case 'next-cargo':
      if (state.mode !== 'practice' || state.phase !== 'revealed') {
        return state;
      }

      return withHistory(state, advanceToNextCargo(clearCargoFeedback(state)));
    case 'mark-repaired':
      return handleMarkRepaired(state, action.cargoId);
  }
}

function handleRescueTimerTick(state: GameState): GameState {
  if (state.mode !== 'rescue-rush' || state.phase === 'round-complete') {
    return state;
  }

  const rescueRushSecondsRemaining = Math.max(0, state.rescueRushSecondsRemaining - 1);

  if (rescueRushSecondsRemaining > 0) {
    return {
      ...state,
      rescueRushSecondsRemaining
    };
  }

  return {
    ...clearCargoFeedback(state),
    rescueRushSecondsRemaining,
    activeCargoId: undefined,
    activeIndex: state.cargoOrder.length,
    phase: 'round-complete'
  };
}

function handleShowHint(state: GameState): GameState {
  const cargo = getActiveCargo(state);
  return cargo ? withHistory(state, { ...state, hintedCargoId: cargo.id }) : state;
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
      classCheck: { cargoId: cargo.id, proposedTarget: target, result },
      revealed: undefined
    });
  }

  if (result.isCorrect) {
    return handleCorrectRescueRushDrop(state, cargo.id);
  }

  return handleWrongRescueRushDrop(state, cargo.id);
}

function handleCorrectRescueRushDrop(state: GameState, cargoId: string): GameState {
  const wrongAttempts = state.attemptsByCargoId[cargoId] ?? 0;
  const points = wrongAttempts > 0 ? 50 : 100;
  const scoringTeam = getScoringTeam(state);

  return withHistory(
    state,
    advanceToNextCargo(
      clearCargoFeedback({
        ...state,
        scores: {
          ...state.scores,
          [scoringTeam]: (state.scores[scoringTeam] ?? 0) + points
        },
        rescuedCargoIds: addUnique(state.rescuedCargoIds, cargoId),
        damagedCargoIds: removeValue(state.damagedCargoIds, cargoId)
      })
    )
  );
}

function handleWrongRescueRushDrop(state: GameState, cargoId: string): GameState {
  const wrongAttempts = (state.attemptsByCargoId[cargoId] ?? 0) + 1;
  const attemptsByCargoId = { ...state.attemptsByCargoId, [cargoId]: wrongAttempts };

  if (wrongAttempts === 1) {
    return withHistory(state, {
      ...state,
      attemptsByCargoId,
      phase: 'ready',
      damagedCargoIds: addUnique(state.damagedCargoIds, cargoId)
    });
  }

  return withHistory(
    state,
    advanceToNextCargo(
      clearCargoFeedback({
        ...state,
        attemptsByCargoId,
        damagedCargoIds: removeValue(state.damagedCargoIds, cargoId),
        repairDockCargoIds: addUnique(state.repairDockCargoIds, cargoId)
      })
    )
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

function handleMarkRepaired(state: GameState, cargoId: string): GameState {
  if (!state.repairDockCargoIds.includes(cargoId)) {
    return state;
  }

  return withHistory(state, {
    ...state,
    repairDockCargoIds: removeValue(state.repairDockCargoIds, cargoId),
    rescuedCargoIds: addUnique(state.rescuedCargoIds, cargoId)
  });
}

function advanceToNextCargo(state: GameState): GameState {
  const blockedCargoIds = new Set([...state.rescuedCargoIds, ...state.repairDockCargoIds]);
  const nextIndex = state.cargoOrder.findIndex((cargoId, index) => {
    return index > state.activeIndex && !blockedCargoIds.has(cargoId);
  });

  if (nextIndex === -1) {
    return {
      ...state,
      activeCargoId: undefined,
      activeIndex: state.cargoOrder.length,
      phase: 'round-complete'
    };
  }

  return {
    ...state,
    activeCargoId: state.cargoOrder[nextIndex],
    activeIndex: nextIndex,
    phase: 'ready'
  };
}

function clearCargoFeedback(state: GameState): GameState {
  return {
    ...state,
    classCheck: undefined,
    revealed: undefined,
    hintedCargoId: undefined
  };
}

function getScoringTeam(state: GameState): string {
  if (state.playStyle === 'team-turns') {
    return state.teams[state.currentTeamIndex];
  }

  return state.teams[0];
}

function withHistory(previous: GameState, next: GameState): GameState {
  return {
    ...next,
    history: [...previous.history, snapshot(previous)]
  };
}

function snapshot(state: GameState): GameSnapshot {
  const { history, ...rest } = state;
  return rest;
}

function createScoreRecord(teams: string[]): Record<string, number> {
  const scores: Record<string, number> = {};

  for (const team of teams) {
    scores[team] = 0;
  }

  return scores;
}

function addUnique(values: string[], value: string): string[] {
  return values.includes(value) ? values : [...values, value];
}

function removeValue(values: string[], value: string): string[] {
  return values.filter((item) => item !== value);
}
