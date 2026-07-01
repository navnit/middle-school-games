import type { MainBinId, TargetId } from '../domain/types';

interface DropBinProps {
  kind: MainBinId;
  activeCargoName?: string;
  onDrop: (target: TargetId) => void;
}

export function DropBin({ kind, activeCargoName = 'cargo', onDrop }: DropBinProps) {
  if (kind === 'molecule') {
    return (
      <section className="drop-bin drop-bin--molecule" data-bin-kind="molecule" aria-labelledby="molecule-bin-title">
        <div className="drop-bin__heading">
          <h2 id="molecule-bin-title">Molecule</h2>
          <p>Two or more atoms bonded together.</p>
        </div>
        <div className="nested-bins" aria-label="Molecule sorting choices">
          <button
            type="button"
            className="nested-bin nested-bin--element"
            onClick={() => onDrop('element-molecule')}
            aria-label={`Drop ${activeCargoName} into Element Molecule`}
          >
            <strong>Element Molecule</strong>
            <span>Same element bonded.</span>
          </button>
          <button
            type="button"
            className="nested-bin nested-bin--compound"
            onClick={() => onDrop('compound-molecule')}
            aria-label={`Drop ${activeCargoName} into Compound Molecule`}
          >
            <strong>Compound Molecule</strong>
            <span>Different elements bonded.</span>
          </button>
        </div>
      </section>
    );
  }

  const target: TargetId = kind;
  const title = kind === 'atom' ? 'Atom' : 'Mixture';
  const note = kind === 'atom' ? 'Single unbonded atom.' : 'Substances together, not bonded.';

  return (
    <button
      type="button"
      className={`drop-bin drop-bin--${kind}`}
      data-bin-kind={kind}
      onClick={() => onDrop(target)}
      aria-label={`Drop ${activeCargoName} into ${title}`}
    >
      <strong>{title}</strong>
      <span>{note}</span>
    </button>
  );
}
