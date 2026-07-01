import type { CargoItem, TargetId, ValidationResult } from './types';
import { TARGET_LABELS } from './types';

export function isMoleculeTarget(target: TargetId): boolean {
  return target === 'element-molecule' || target === 'compound-molecule';
}

export function getTargetLabel(target: TargetId): string {
  return TARGET_LABELS[target];
}

export function validateDrop(cargo: CargoItem, receivedTarget: TargetId): ValidationResult {
  return {
    cargoId: cargo.id,
    isCorrect: cargo.target === receivedTarget,
    expectedTarget: cargo.target,
    receivedTarget,
    explanation: cargo.explanation
  };
}
