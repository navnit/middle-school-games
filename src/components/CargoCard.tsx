import type { DragEvent, PointerEvent } from 'react';
import type { CargoItem } from '../domain/types';
import { CARGO_DRAG_MIME_TYPE } from '../domain/types';
import { ParticleDiagram } from './ParticleDiagram';

export type CargoCardState = 'active' | 'queued' | 'damaged' | 'repair-dock' | 'rescued';

export interface DragPoint {
  x: number;
  y: number;
}

interface CargoCardProps {
  cargo: CargoItem;
  state: CargoCardState;
  onSelect?: (cargoId: string) => void;
  isDraggable?: boolean;
  isDragging?: boolean;
  onCargoDragStart?: (cargoId: string) => void;
  onCargoDragEnd?: () => void;
  onCargoPointerDragStart?: (cargoId: string, point: DragPoint) => void;
}

const STATUS_LABELS: Partial<Record<CargoCardState, string>> = {
  damaged: 'Damaged',
  'repair-dock': 'Repair Dock'
};

export function CargoCard({
  cargo,
  state,
  onSelect,
  isDraggable = false,
  isDragging = false,
  onCargoDragStart,
  onCargoDragEnd,
  onCargoPointerDragStart
}: CargoCardProps) {
  const statusLabel = STATUS_LABELS[state];
  const cardContent = (
    <>
      <span className="cargo-card__diagram">
        <ParticleDiagram diagram={cargo.diagram} title={`${cargo.displayName} particle diagram`} />
      </span>
      <span className="cargo-card__name">{cargo.displayName}</span>
      {cargo.formula ? <span className="cargo-card__formula">{cargo.formula}</span> : null}
      {statusLabel ? <span className="cargo-card__status">{statusLabel}</span> : null}
    </>
  );
  const handleDragStart = (event: DragEvent<HTMLElement>) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData(CARGO_DRAG_MIME_TYPE, cargo.id);
    event.dataTransfer.setData('text/plain', cargo.id);
    onCargoDragStart?.(cargo.id);
  };
  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }

    if (event.pointerType !== 'mouse') {
      event.preventDefault();
    }

    onCargoPointerDragStart?.(cargo.id, { x: event.clientX, y: event.clientY });
  };
  const draggableProps = isDraggable
    ? {
        draggable: true,
        onDragStart: handleDragStart,
        onDragEnd: onCargoDragEnd,
        onPointerDown: handlePointerDown,
        'aria-grabbed': isDragging,
        'data-draggable-cargo': 'true'
      }
    : {
        draggable: false
      };

  if (!onSelect) {
    return (
      <article
        className={`cargo-card cargo-card--${state}`}
        data-cargo-state={state}
        aria-label={`${cargo.displayName} cargo`}
        {...draggableProps}
      >
        {cardContent}
      </article>
    );
  }

  return (
    <button
      type="button"
      className={`cargo-card cargo-card--${state}`}
      data-cargo-state={state}
      onClick={() => onSelect(cargo.id)}
      aria-label={`Select ${cargo.displayName} cargo`}
      {...draggableProps}
    >
      {cardContent}
    </button>
  );
}
