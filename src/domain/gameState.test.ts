import { describe, expect, it } from 'vitest';
import { CARGO_LIBRARY } from '../content/cargoLibrary';
import { createInitialGameState, gameReducer, getActiveCargo } from './gameState';

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

  it('scores first-try Rescue Rush drops at 100 points and advances', () => {
    const state = createInitialGameState(CARGO_LIBRARY, { cargoOrder, mode: 'rescue-rush' });
    const next = gameReducer(state, { type: 'drop-on-target', target: 'atom' });

    expect(next.scores.Alpha).toBe(100);
    expect(next.rescuedCargoIds).toEqual(['helium']);
    expect(next.activeCargoId).toBe('ozone-o3');
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
});
