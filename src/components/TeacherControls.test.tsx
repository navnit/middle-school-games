import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TeacherControls } from './TeacherControls';

const handlers = {
  onModeChange: vi.fn(),
  onPlayStyleChange: vi.fn(),
  onHint: vi.fn(),
  onReveal: vi.fn(),
  onNext: vi.fn(),
  onUndo: vi.fn(),
  onPause: vi.fn(),
  onSwitchTeam: vi.fn()
};

describe('TeacherControls', () => {
  it('renders the command guidance label', () => {
    render(
      <TeacherControls
        mode="practice"
        playStyle="co-op"
        paused={false}
        canHint
        canReveal={false}
        canAdvance={false}
        canUndo={false}
        guidanceLabel="Ask For Evidence"
        {...handlers}
      />
    );

    expect(screen.getByText('Ask For Evidence')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hint' })).toBeEnabled();
  });

  it('keeps the existing command dock valid when guidance is omitted', () => {
    const { container } = render(
      <TeacherControls
        mode="practice"
        playStyle="co-op"
        paused={false}
        canHint
        canReveal={false}
        canAdvance={false}
        canUndo={false}
        {...handlers}
      />
    );

    expect(container.querySelector('.teacher-controls__guidance')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hint' })).toBeEnabled();
  });
});
