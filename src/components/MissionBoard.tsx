import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { getCosmoFeedback } from '../domain/cosmoFeedback';
import { createInitialGameState, gameReducer, getActiveCargo } from '../domain/gameState';
import type { CargoItem, TargetId } from '../domain/types';
import { TARGET_LABELS } from '../domain/types';
import { CargoBelt } from './CargoBelt';
import type { DragPoint } from './CargoCard';
import { CargoCard } from './CargoCard';
import { CosmoCoach } from './CosmoCoach';
import { DropBin } from './DropBin';
import { TeacherControls } from './TeacherControls';

interface MissionBoardProps {
  cargoItems: CargoItem[];
  initialCargoOrder?: string[];
}

const DROP_TARGET_IDS: TargetId[] = ['atom', 'element-molecule', 'compound-molecule', 'mixture'];

function readDropTargetFromPoint(x: number, y: number): TargetId | undefined {
  const dropTarget = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-drop-target]');
  const target = dropTarget?.dataset.dropTarget;

  return DROP_TARGET_IDS.includes(target as TargetId) ? (target as TargetId) : undefined;
}

function formatMissionClock(secondsRemaining: number): string {
  const minutes = Math.floor(secondsRemaining / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (secondsRemaining % 60).toString().padStart(2, '0');

  return `${minutes}:${seconds}`;
}

export function MissionBoard({ cargoItems, initialCargoOrder }: MissionBoardProps) {
  const initialState = useMemo(
    () => createInitialGameState(cargoItems, { cargoOrder: initialCargoOrder }),
    [cargoItems, initialCargoOrder]
  );
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [draggingCargoId, setDraggingCargoId] = useState<string | undefined>();
  const [dragPoint, setDragPoint] = useState<DragPoint | undefined>();
  const activeCargo = getActiveCargo(state);
  const currentTeam = state.teams[state.currentTeamIndex];
  const score =
    state.playStyle === 'co-op'
      ? Object.values(state.scores).reduce((total, teamScore) => total + teamScore, 0)
      : state.scores[currentTeam];

  const queuedCargo = state.cargoOrder
    .slice(state.activeIndex + 1, state.activeIndex + 4)
    .map((cargoId) => cargoItems.find((item) => item.id === cargoId))
    .filter((cargo): cargo is CargoItem => Boolean(cargo));
  const draggingCargo = draggingCargoId
    ? cargoItems.find((item) => item.id === draggingCargoId)
    : undefined;
  const isActiveCargoDraggable = Boolean(activeCargo && !state.paused);
  const isRescueRush = state.mode === 'rescue-rush';
  const cosmoFeedback = getCosmoFeedback(state, activeCargo);
  const guidanceLabel = isRescueRush ? 'Rescue Commands' : 'Ask For Evidence';
  const clearDragState = useCallback(() => {
    setDraggingCargoId(undefined);
    setDragPoint(undefined);
  }, []);
  const handleDropOnTarget = useCallback(
    (target: TargetId) => {
      clearDragState();
      dispatch({ type: 'drop-on-target', target });
    },
    [clearDragState]
  );
  const handleCargoDragStart = useCallback(
    (cargoId: string) => {
      if (cargoId === activeCargo?.id && !state.paused) {
        setDraggingCargoId(cargoId);
      }
    },
    [activeCargo?.id, state.paused]
  );
  const handleCargoPointerDragStart = useCallback(
    (cargoId: string, point: DragPoint) => {
      if (cargoId === activeCargo?.id && !state.paused) {
        setDraggingCargoId(cargoId);
        setDragPoint(point);
      }
    },
    [activeCargo?.id, state.paused]
  );

  useEffect(() => {
    if (!draggingCargoId) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      setDragPoint({ x: event.clientX, y: event.clientY });
    };
    const handlePointerUp = (event: PointerEvent) => {
      const target = readDropTargetFromPoint(event.clientX, event.clientY);

      clearDragState();

      if (target && draggingCargoId === activeCargo?.id && !state.paused) {
        dispatch({ type: 'drop-on-target', target });
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', clearDragState);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', clearDragState);
    };
  }, [activeCargo?.id, clearDragState, draggingCargoId, state.paused]);

  useEffect(() => {
    if (state.mode !== 'rescue-rush' || state.paused || state.phase === 'round-complete') {
      return;
    }

    const timerId = window.setInterval(() => {
      dispatch({ type: 'tick-rescue-timer' });
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [state.mode, state.paused, state.phase]);

  return (
    <main
      className={`mission-board mission-board--${state.mode}${draggingCargoId ? ' mission-board--dragging' : ''}`}
      aria-label="Space Cargo Sorter mission board"
    >
      <header className="mission-topbar">
        <div className="mission-title">
          <p className="eyebrow">Teacher-led chemistry rescue</p>
          <h1>Space Cargo Sorter</h1>
        </div>
        <div className="mission-status" aria-label="Round status">
          <span>{state.mode === 'practice' ? 'Practice Mode' : 'Rescue Rush'}</span>
          <span>{state.paused ? 'Paused' : 'Round Active'}</span>
          <span aria-label={state.mode === 'rescue-rush' ? 'Mission clock' : undefined}>
            {state.mode === 'rescue-rush'
              ? formatMissionClock(state.rescueRushSecondsRemaining)
              : state.phase === 'round-complete'
                ? 'Round Complete'
                : `Cargo ${state.activeIndex + 1} of ${state.cargoOrder.length}`}
          </span>
        </div>
        <div className="score-panel" aria-label="Score panel">
          <span>{state.playStyle === 'team-turns' ? `Current Team: ${currentTeam}` : 'Class Co-op'}</span>
          <strong>Score: {score}</strong>
        </div>
      </header>

      <div className="mission-layout">
        <section className="cargo-panel" aria-labelledby="active-cargo-title">
          <div className="panel-heading">
            <p className="eyebrow">Cargo Bay</p>
            <h2 id="active-cargo-title">{isRescueRush ? 'Upcoming Cargo' : 'Active Cargo'}</h2>
          </div>

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
        </section>

        <section className="sorting-board" aria-label="Rescue bays">
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
          <DropBin
            kind="atom"
            activeCargoName={activeCargo?.displayName}
            isDragActive={Boolean(draggingCargoId)}
            onDrop={handleDropOnTarget}
          />
          <DropBin
            kind="molecule"
            activeCargoName={activeCargo?.displayName}
            isDragActive={Boolean(draggingCargoId)}
            onDrop={handleDropOnTarget}
          />
          <DropBin
            kind="mixture"
            activeCargoName={activeCargo?.displayName}
            isDragActive={Boolean(draggingCargoId)}
            onDrop={handleDropOnTarget}
          />
        </section>

        <section className="feedback-panel" aria-label="Feedback and teacher panel">
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

          {state.mode === 'rescue-rush' ? (
            <section className="rush-dashboard" aria-label="Rescue Rush progress">
              <span>Saved {state.rescuedCargoIds.length}/{state.cargoOrder.length}</span>
              <span>Damaged {state.damagedCargoIds.length}</span>
              <span>Repair Dock {state.repairDockCargoIds.length}</span>
            </section>
          ) : null}

          <div className="feedback-stack">
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
                <p>Proposed bay: {TARGET_LABELS[state.classCheck.proposedTarget]}</p>
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
              <section className="feedback-card feedback-card--repair" aria-labelledby="repair-dock-title">
                <h2 id="repair-dock-title">Repair Dock</h2>
                <div className="repair-list">
                  {state.repairDockCargoIds.map((cargoId) => {
                    const cargo = cargoItems.find((item) => item.id === cargoId);

                    if (!cargo) {
                      return null;
                    }

                    return (
                      <div className="repair-item" key={cargo.id}>
                        <div className="repair-item__cargo">
                          <strong>{cargo.displayName}</strong>
                          {cargo.formula ? <span>{cargo.formula}</span> : null}
                        </div>
                        <button
                          type="button"
                          aria-label={`Mark ${cargo.displayName} repaired`}
                          onClick={() => dispatch({ type: 'mark-repaired', cargoId: cargo.id })}
                        >
                          Mark Repaired
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            ) : null}
          </div>
        </section>
      </div>
      {draggingCargo && dragPoint ? (
        <div
          className="drag-ghost"
          aria-hidden="true"
          style={{ left: dragPoint.x, top: dragPoint.y }}
        >
          {draggingCargo.formula ?? draggingCargo.displayName}
        </div>
      ) : null}
    </main>
  );
}
