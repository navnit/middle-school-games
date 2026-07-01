import type {
  ParticleDiagram as ParticleDiagramData,
  ParticleNode,
  ParticleNodeKind
} from '../domain/types';

interface ParticleDiagramProps {
  diagram: ParticleDiagramData;
  title: string;
}

const KIND_CAPTIONS: Record<ParticleNodeKind, string> = {
  atom: 'atom',
  molecule: 'molecule',
  ion: 'ion',
  'mixture-component': 'mixture component'
};

function getComponentWidth(node: ParticleNode): number {
  return Math.min(42, Math.max(24, node.label.length * 4.6 + 10));
}

function renderNodeShape(node: ParticleNode) {
  if (node.nodeKind === 'mixture-component') {
    const width = getComponentWidth(node);

    return (
      <rect
        className="particle-shape particle-shape--mixture-component"
        x={node.x - width / 2}
        y={node.y - 11}
        width={width}
        height="22"
        rx="6"
        fill={node.color}
      />
    );
  }

  return (
    <>
      <circle className="particle-shape particle-shape--atom" cx={node.x} cy={node.y} r="12" fill={node.color} />
      {node.nodeKind === 'ion' ? (
        <circle className="particle-ion-ring" cx={node.x} cy={node.y} r="16" />
      ) : null}
    </>
  );
}

export function ParticleDiagram({ diagram, title }: ParticleDiagramProps) {
  const nodeById = new Map(diagram.atoms.map((atom) => [atom.id, atom]));

  return (
    <svg className="particle-diagram" viewBox="0 0 100 100" role="img" aria-label={title}>
      {diagram.bonds.map((bond) => {
        const from = nodeById.get(bond.from);
        const to = nodeById.get(bond.to);

        if (!from || !to) {
          return null;
        }

        return (
          <line
            key={`${bond.from}-${bond.to}`}
            className="particle-bond"
            data-particle-bond
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
          />
        );
      })}

      {diagram.atoms.map((node) => {
        const caption = KIND_CAPTIONS[node.nodeKind];
        const shouldShowKindCaption = node.nodeKind === 'ion' || node.nodeKind === 'mixture-component';

        return (
          <g
            key={node.id}
            className={`particle-node particle-node--${node.nodeKind}`}
            data-particle-node
            data-node-kind={node.nodeKind}
          >
            <title>{`${node.label} ${caption}`}</title>
            {renderNodeShape(node)}
            <text className="particle-label" x={node.x} y={node.y + 4} textAnchor="middle">
              {node.label}
            </text>
            {shouldShowKindCaption ? (
              <text className="particle-kind-caption" x={node.x} y={node.y + 22} textAnchor="middle">
                {node.nodeKind === 'ion' ? 'ion' : 'mix'}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
