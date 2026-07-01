export type TargetId = 'atom' | 'element-molecule' | 'compound-molecule' | 'mixture';

export type MainBinId = 'atom' | 'molecule' | 'mixture';

export type GameMode = 'practice' | 'rescue-rush';

export type PlayStyle = 'co-op' | 'team-turns';

export type CargoKind = 'particle-diagram' | 'real-world' | 'hybrid';

export type ParticleNodeKind = 'atom' | 'molecule' | 'ion' | 'mixture-component';

export interface ParticleNode {
  id: string;
  nodeKind: ParticleNodeKind;
  element: string;
  label: string;
  x: number;
  y: number;
  color: string;
}

export interface ParticleBond {
  from: string;
  to: string;
}

export interface ParticleDiagram {
  atoms: ParticleNode[];
  bonds: ParticleBond[];
}

export interface CargoItem {
  id: string;
  displayName: string;
  formula?: string;
  kind: CargoKind;
  target: TargetId;
  hint: string;
  explanation: string;
  teacherNote?: string;
  diagram: ParticleDiagram;
}

export interface ValidationResult {
  cargoId: string;
  isCorrect: boolean;
  expectedTarget: TargetId;
  receivedTarget: TargetId;
  explanation: string;
}

export const TARGET_LABELS: Record<TargetId, string> = {
  atom: 'Atom',
  'element-molecule': 'Element Molecule',
  'compound-molecule': 'Compound Molecule',
  mixture: 'Mixture'
};

export const MAIN_BIN_LABELS: Record<MainBinId, string> = {
  atom: 'Atom',
  molecule: 'Molecule',
  mixture: 'Mixture'
};
