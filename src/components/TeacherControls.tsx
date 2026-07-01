import type { GameMode, PlayStyle } from '../domain/types';

interface TeacherControlsProps {
  mode: GameMode;
  playStyle: PlayStyle;
  paused: boolean;
  canHint: boolean;
  canReveal: boolean;
  canAdvance: boolean;
  canUndo: boolean;
  onModeChange: (mode: GameMode) => void;
  onPlayStyleChange: (playStyle: PlayStyle) => void;
  onHint: () => void;
  onReveal: () => void;
  onNext: () => void;
  onUndo: () => void;
  onPause: () => void;
  onSwitchTeam: () => void;
}

export function TeacherControls({
  mode,
  playStyle,
  paused,
  canHint,
  canReveal,
  canAdvance,
  canUndo,
  onModeChange,
  onPlayStyleChange,
  onHint,
  onReveal,
  onNext,
  onUndo,
  onPause,
  onSwitchTeam
}: TeacherControlsProps) {
  return (
    <aside className="teacher-controls" aria-label="Teacher controls">
      <div className="teacher-controls__selects">
        <label className="teacher-control">
          <span>Mode</span>
          <select value={mode} onChange={(event) => onModeChange(event.target.value as GameMode)}>
            <option value="practice">Practice Mode</option>
            <option value="rescue-rush">Rescue Rush</option>
          </select>
        </label>

        <label className="teacher-control">
          <span>Play style</span>
          <select value={playStyle} onChange={(event) => onPlayStyleChange(event.target.value as PlayStyle)}>
            <option value="co-op">Co-op</option>
            <option value="team-turns">Team Turns</option>
          </select>
        </label>
      </div>

      <div className="teacher-controls__buttons">
        <button type="button" onClick={onHint} disabled={!canHint}>
          Hint
        </button>
        <button type="button" onClick={onReveal} disabled={!canReveal}>
          Reveal
        </button>
        <button type="button" onClick={onNext} disabled={!canAdvance}>
          Next Cargo
        </button>
        <button type="button" onClick={onUndo} disabled={!canUndo}>
          Undo
        </button>
        <button type="button" onClick={onPause}>
          {paused ? 'Resume' : 'Pause'}
        </button>
        <button type="button" onClick={onSwitchTeam} disabled={playStyle !== 'team-turns'}>
          Switch Team
        </button>
      </div>
    </aside>
  );
}
