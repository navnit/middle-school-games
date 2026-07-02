import { describe, expect, it } from 'vitest';
import { CARGO_LIBRARY } from '../content/cargoLibrary';
import {
  RESCUE_RUSH_SECONDS,
  createInitialGameState,
  gameReducer,
  getActiveCargo
} from './gameState';

const cargoOrder = ['helium', 'ozone-o3', 'water-h2o'];

describe('gameReducer', () => {
  it('puts Practice drops into class-check and does not rescue until reveal', () => {
    const state = createInitialGameState(CARGO_LIBRARY, { cargoOrder, mode: 'practice' });
    const next = gameReducer(state, { type: 'drop-on-target', target: 'atom' });

    expect(next.phase).toBe('class-check');
    expect(next.activeCargoId).toBe('helium');
    expect(next.classCheck).toMatchObject({
      cargoId: 'helium',
      proposedTarget: 'atom',
      result: { isCorrect: true }
    });
    expect(next.rescuedCargoIds).toEqual([]);
  });

  it('reveals and then next-cargo advances to the next cargo', () => {
    const state = createInitialGameState(CARGO_LIBRARY, { cargoOrder, mode: 'practice' });
    const checked = gameReducer(state, { type: 'drop-on-target', target: 'atom' });
    const revealed = gameReducer(checked, { type: 'reveal' });
    const advanced = gameReducer(revealed, { type: 'next-cargo' });

    expect(revealed.phase).toBe('revealed');
    expect(revealed.revealed).toMatchObject({ cargoId: 'helium', isCorrect: true });
    expect(revealed.rescuedCargoIds).toEqual(['helium']);
    expect(advanced.phase).toBe('ready');
    expect(advanced.activeCargoId).toBe('ozone-o3');
    expect(getActiveCargo(advanced)?.id).toBe('ozone-o3');
  });

  it('does not advance or lose cargo when next-cargo is dispatched from ready', () => {
    const state = createInitialGameState(CARGO_LIBRARY, { cargoOrder, mode: 'practice' });
    const next = gameReducer(state, { type: 'next-cargo' });

    expect(next.activeCargoId).toBe('helium');
    expect(next.activeIndex).toBe(0);
    expect(next.phase).toBe('ready');
    expect(next.rescuedCargoIds).toEqual([]);
    expect(next.history).toEqual([]);
  });

  it('does not advance when next-cargo is dispatched from class-check before reveal', () => {
    const state = createInitialGameState(CARGO_LIBRARY, { cargoOrder, mode: 'practice' });
    const checked = gameReducer(state, { type: 'drop-on-target', target: 'atom' });
    const next = gameReducer(checked, { type: 'next-cargo' });

    expect(next.activeCargoId).toBe('helium');
    expect(next.activeIndex).toBe(0);
    expect(next.phase).toBe('class-check');
    expect(next.classCheck).toMatchObject({ cargoId: 'helium' });
    expect(next.rescuedCargoIds).toEqual([]);
  });

  it('intentionally resolves a wrong Practice drop after reveal and advances after next-cargo', () => {
    const state = createInitialGameState(CARGO_LIBRARY, { cargoOrder, mode: 'practice' });
    const checked = gameReducer(state, { type: 'drop-on-target', target: 'mixture' });
    const revealed = gameReducer(checked, { type: 'reveal' });
    const advanced = gameReducer(revealed, { type: 'next-cargo' });

    expect(checked.classCheck?.result.isCorrect).toBe(false);
    expect(revealed.phase).toBe('revealed');
    expect(revealed.revealed).toMatchObject({ cargoId: 'helium', isCorrect: false });
    expect(revealed.rescuedCargoIds).toEqual(['helium']);
    expect(advanced.activeCargoId).toBe('ozone-o3');
  });

  it('does not skip active Rescue Rush cargo when next-cargo is dispatched directly', () => {
    const state = createInitialGameState(CARGO_LIBRARY, { cargoOrder, mode: 'rescue-rush' });
    const next = gameReducer(state, { type: 'next-cargo' });

    expect(next.activeCargoId).toBe('helium');
    expect(next.activeIndex).toBe(0);
    expect(next.phase).toBe('ready');
    expect(next.rescuedCargoIds).toEqual([]);
    expect(next.repairDockCargoIds).toEqual([]);
  });

  it('scores first-try Rescue Rush drops at 100 points and advances', () => {
    const state = createInitialGameState(CARGO_LIBRARY, { cargoOrder, mode: 'rescue-rush' });
    const next = gameReducer(state, { type: 'drop-on-target', target: 'atom' });

    expect(next.scores.Alpha).toBe(100);
    expect(next.rescuedCargoIds).toEqual(['helium']);
    expect(next.activeCargoId).toBe('ozone-o3');
  });

  it('counts down the Rescue Rush timer without adding undo history', () => {
    const state = createInitialGameState(CARGO_LIBRARY, { cargoOrder, mode: 'rescue-rush' });
    const ticked = gameReducer(state, { type: 'tick-rescue-timer' });

    expect(state.rescueRushSecondsRemaining).toBe(RESCUE_RUSH_SECONDS);
    expect(ticked.rescueRushSecondsRemaining).toBe(RESCUE_RUSH_SECONDS - 1);
    expect(ticked.history).toEqual([]);
  });

  it('does not count down the timer in Practice Mode or while paused', () => {
    const practice = createInitialGameState(CARGO_LIBRARY, { cargoOrder, mode: 'practice' });
    const rescueRush = createInitialGameState(CARGO_LIBRARY, { cargoOrder, mode: 'rescue-rush' });
    const paused = gameReducer(rescueRush, { type: 'toggle-pause' });

    expect(gameReducer(practice, { type: 'tick-rescue-timer' })).toBe(practice);
    expect(gameReducer(paused, { type: 'tick-rescue-timer' })).toBe(paused);
  });

  it('ends Rescue Rush when the timer reaches zero', () => {
    let state = createInitialGameState(CARGO_LIBRARY, { cargoOrder, mode: 'rescue-rush' });

    for (let index = 0; index < RESCUE_RUSH_SECONDS; index += 1) {
      state = gameReducer(state, { type: 'tick-rescue-timer' });
    }

    expect(state.rescueRushSecondsRemaining).toBe(0);
    expect(state.phase).toBe('round-complete');
    expect(state.activeCargoId).toBeUndefined();
  });

  it('damages Rescue Rush cargo on the first wrong drop and keeps it active', () => {
    const state = createInitialGameState(CARGO_LIBRARY, { cargoOrder, mode: 'rescue-rush' });
    const damaged = gameReducer(state, { type: 'drop-on-target', target: 'mixture' });

    expect(damaged.scores.Alpha).toBe(0);
    expect(damaged.activeCargoId).toBe('helium');
    expect(damaged.damagedCargoIds).toEqual(['helium']);
    expect(damaged.attemptsByCargoId.helium).toBe(1);
  });

  it('scores second-attempt Rescue Rush rescues at 50 points and advances', () => {
    const state = createInitialGameState(CARGO_LIBRARY, { cargoOrder, mode: 'rescue-rush' });
    const damaged = gameReducer(state, { type: 'drop-on-target', target: 'mixture' });
    const rescued = gameReducer(damaged, { type: 'drop-on-target', target: 'atom' });

    expect(rescued.scores.Alpha).toBe(50);
    expect(rescued.rescuedCargoIds).toEqual(['helium']);
    expect(rescued.damagedCargoIds).toEqual([]);
    expect(rescued.activeCargoId).toBe('ozone-o3');
  });

  it('moves Rescue Rush cargo to the Repair Dock after two wrong drops and advances', () => {
    const state = createInitialGameState(CARGO_LIBRARY, { cargoOrder, mode: 'rescue-rush' });
    const damaged = gameReducer(state, { type: 'drop-on-target', target: 'mixture' });
    const repairDock = gameReducer(damaged, { type: 'drop-on-target', target: 'compound-molecule' });

    expect(repairDock.scores.Alpha).toBe(0);
    expect(repairDock.rescuedCargoIds).toEqual([]);
    expect(repairDock.damagedCargoIds).toEqual([]);
    expect(repairDock.repairDockCargoIds).toEqual(['helium']);
    expect(repairDock.activeCargoId).toBe('ozone-o3');
  });

  it('marks Repair Dock cargo repaired without adding score', () => {
    const state = createInitialGameState(CARGO_LIBRARY, { cargoOrder, mode: 'rescue-rush' });
    const damaged = gameReducer(state, { type: 'drop-on-target', target: 'mixture' });
    const repairDock = gameReducer(damaged, { type: 'drop-on-target', target: 'compound-molecule' });
    const repaired = gameReducer(repairDock, { type: 'mark-repaired', cargoId: 'helium' });

    expect(repaired.scores.Alpha).toBe(0);
    expect(repaired.repairDockCargoIds).toEqual([]);
    expect(repaired.rescuedCargoIds).toEqual(['helium']);
  });

  it('undo after mark-repaired restores the Repair Dock entry', () => {
    const state = createInitialGameState(CARGO_LIBRARY, { cargoOrder, mode: 'rescue-rush' });
    const damaged = gameReducer(state, { type: 'drop-on-target', target: 'mixture' });
    const repairDock = gameReducer(damaged, { type: 'drop-on-target', target: 'compound-molecule' });
    const repaired = gameReducer(repairDock, { type: 'mark-repaired', cargoId: 'helium' });
    const undone = gameReducer(repaired, { type: 'undo' });

    expect(undone.repairDockCargoIds).toEqual(['helium']);
    expect(undone.rescuedCargoIds).toEqual([]);
    expect(undone.activeCargoId).toBe('ozone-o3');
  });

  it('tracks Alpha and Beta team scoring and switch-team changes the current team', () => {
    const state = createInitialGameState(CARGO_LIBRARY, {
      cargoOrder,
      mode: 'rescue-rush',
      playStyle: 'team-turns'
    });
    const alphaScored = gameReducer(state, { type: 'drop-on-target', target: 'atom' });
    const betaTurn = gameReducer(alphaScored, { type: 'switch-team' });
    const betaScored = gameReducer(betaTurn, {
      type: 'drop-on-target',
      target: 'element-molecule'
    });

    expect(alphaScored.scores.Alpha).toBe(100);
    expect(alphaScored.scores.Beta).toBe(0);
    expect(betaTurn.currentTeamIndex).toBe(1);
    expect(betaScored.scores.Alpha).toBe(100);
    expect(betaScored.scores.Beta).toBe(100);
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
    expect(undone.history).toEqual([]);
  });

  it('undo after reveal and next-cargo restores the revealed active cargo state', () => {
    const state = createInitialGameState(CARGO_LIBRARY, { cargoOrder, mode: 'practice' });
    const checked = gameReducer(state, { type: 'drop-on-target', target: 'atom' });
    const revealed = gameReducer(checked, { type: 'reveal' });
    const advanced = gameReducer(revealed, { type: 'next-cargo' });
    const undone = gameReducer(advanced, { type: 'undo' });

    expect(undone.activeCargoId).toBe('helium');
    expect(undone.phase).toBe('revealed');
    expect(undone.revealed).toMatchObject({ cargoId: 'helium', isCorrect: true });
    expect(undone.rescuedCargoIds).toEqual(['helium']);
  });

  it('undo after mode change restores the previous mode and state', () => {
    const state = createInitialGameState(CARGO_LIBRARY, { cargoOrder, mode: 'practice' });
    const hinted = gameReducer(state, { type: 'show-hint' });
    const rescueRush = gameReducer(hinted, { type: 'set-mode', mode: 'rescue-rush' });
    const undone = gameReducer(rescueRush, { type: 'undo' });

    expect(rescueRush.mode).toBe('rescue-rush');
    expect(rescueRush.hintedCargoId).toBeUndefined();
    expect(undone.mode).toBe('practice');
    expect(undone.activeCargoId).toBe('helium');
    expect(undone.hintedCargoId).toBe('helium');
  });

  it('blocks gameplay actions while paused and resumes with toggle-pause', () => {
    const state = createInitialGameState(CARGO_LIBRARY, { cargoOrder, mode: 'practice' });
    const paused = gameReducer(state, { type: 'toggle-pause' });
    const afterDrop = gameReducer(paused, { type: 'drop-on-target', target: 'atom' });
    const afterHint = gameReducer(afterDrop, { type: 'show-hint' });
    const afterNextCargo = gameReducer(afterHint, { type: 'next-cargo' });
    const resumed = gameReducer(afterNextCargo, { type: 'toggle-pause' });
    const checked = gameReducer(resumed, { type: 'drop-on-target', target: 'atom' });

    expect(paused.paused).toBe(true);
    expect(afterDrop).toBe(paused);
    expect(afterHint).toBe(paused);
    expect(afterNextCargo).toBe(paused);
    expect(resumed.paused).toBe(false);
    expect(checked.phase).toBe('class-check');
    expect(checked.activeCargoId).toBe('helium');
  });
});
