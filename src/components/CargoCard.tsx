import type { CargoItem } from '../domain/types';
import { ParticleDiagram } from './ParticleDiagram';

export type CargoCardState = 'active' | 'queued' | 'damaged' | 'repair-dock' | 'rescued';

interface CargoCardProps {
  cargo: CargoItem;
  state: CargoCardState;
  onSelect?: (cargoId: string) => void;
}

const STATUS_LABELS: Partial<Record<CargoCardState, string>> = {
  damaged: 'Damaged',
  'repair-dock': 'Repair Dock'
};

export function CargoCard({ cargo, state, onSelect }: CargoCardProps) {
  const statusLabel = STATUS_LABELS[state];

  return (
    <button
      type="button"
      className={`cargo-card cargo-card--${state}`}
      data-cargo-state={state}
      onClick={() => onSelect?.(cargo.id)}
      aria-label={`Select ${cargo.displayName} cargo`}
    >
      <span className="cargo-card__diagram">
        <ParticleDiagram diagram={cargo.diagram} title={`${cargo.displayName} particle diagram`} />
      </span>
      <span className="cargo-card__name">{cargo.displayName}</span>
      {cargo.formula ? <span className="cargo-card__formula">{cargo.formula}</span> : null}
      {statusLabel ? <span className="cargo-card__status">{statusLabel}</span> : null}
    </button>
  );
}
