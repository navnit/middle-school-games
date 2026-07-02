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
