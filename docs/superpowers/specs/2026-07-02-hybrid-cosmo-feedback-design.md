# Hybrid Cosmo Feedback Design

## Summary

This update improves Space Cargo Sorter after the v1 classroom-board build. The approved direction is a hybrid layout: Practice Mode remains teacher-led and evidence-focused, while Rescue Rush becomes more game-like. In both modes, Cosmo becomes a prominent teaching partner who gives hints, feedback, rescue warnings, and celebration.

The goal is not to add new chemistry categories or a larger game system. The goal is to make the existing game easier to read on a classroom touchscreen and make the creature feel meaningful instead of decorative.

## Current Problems

- The center board has too much empty vertical space compared with the active task.
- The active cargo, bins, teacher actions, and feedback are split across separate zones, so the class has to scan the whole screen to understand what is happening.
- Cosmo is visually present, but does not own enough of the feedback loop.
- The right teacher panel can feel like generic app controls instead of part of the game.
- Practice Mode and Rescue Rush currently share too much layout personality even though their teaching goals are different.

## Design Goals

- Make Cosmo large enough to be a first-class classroom signal.
- Move hints, class-check prompts, wrong-answer warnings, repair notices, and success feedback into a Cosmo communication panel.
- Keep Practice Mode calm, teacher-led, and evidence-focused.
- Make Rescue Rush feel faster and more playful by moving the active cargo closer to the bins.
- Preserve the existing learning model: `Atom`, `Molecule` with nested `Element Molecule` and `Compound Molecule`, and `Mixture`.
- Preserve no-scroll behavior across the existing classroom, tablet, and in-app browser viewport checks.
- Keep all controls reachable on a touchscreen with clear disabled states.

## Mode Layouts

### Practice Mode

Practice Mode should become the classroom discussion view.

- Active cargo remains visible in a side cargo area so the teacher can point to it.
- A visible class-vote/evidence prompt appears near the cargo or above the bins.
- Cosmo’s large communication panel asks the class to justify before reveal.
- The primary teacher action copy becomes evidence-oriented, such as `Ask For Evidence`, with `Hint`, `Reveal`, and `Next Cargo` nearby.
- Bins stay clear and readable, but they do not need to feel arcade-like.

Practice Mode feedback examples:

- Initial: `Cosmo is listening for evidence.`
- After a proposed drop: `Ask the class: what evidence supports this bay?`
- Hint: `Look at whether the atoms are bonded.`
- Correct reveal: `Good evidence. Helium is one unbonded atom.`
- Review reveal: `Let's compare the evidence with the correct bay.`

### Rescue Rush

Rescue Rush should become the fast play view.

- Active cargo moves into or immediately above the rescue board so the item is close to the sorting action.
- The upcoming queue becomes a compact cargo belt instead of large stacked cards.
- Timer, saved count, damaged count, and repair dock count remain visible.
- Cosmo’s communication panel gives fast feedback and state changes.
- Wrong drops switch Cosmo into warning mode and clearly explain that the cargo can still be rescued on the second try.

Rescue Rush feedback examples:

- Initial: `Cosmo says: ready.`
- Hint: `Check: bonded atoms or substances mixed together?`
- First wrong drop: `Cargo damaged. Try one more bay.`
- Second wrong drop: `Send it to the Repair Dock and review the evidence.`
- Correct drop: `Rescued!`
- Round complete: `Mission complete. Review the repair dock if needed.`

## Cosmo System

Cosmo should be modeled as a feedback surface, not only an SVG mascot.

Cosmo needs:

- A larger avatar with clear emotional states.
- A speech or communication panel that can hold one short headline and one short supporting sentence.
- Tone states for `ready`, `practice`, `hint`, `class-check`, `success`, `warning`, `repair`, `paused`, and `complete`.
- Accessible text that mirrors the visual message.
- Reduced-motion-safe animation for state changes, such as a quick pulse on hint, warning, or success.

Cosmo should not create long narration. The messages should stay short enough to read from a touchscreen distance.

## Teacher Controls

Teacher controls should become a compact command dock rather than a tall empty side panel.

Required controls remain:

- Mode
- Play style
- Hint
- Reveal
- Next Cargo
- Undo
- Pause or Resume
- Switch Team

In Practice Mode, `Reveal` stays disabled until the class-check flow makes it relevant. In Rescue Rush, hint and pause remain easy to reach, while reveal is less visually dominant.

## Data And State

The current reducer already has most of the required states: mode, phase, hint, reveal, damaged cargo, repair dock, paused, score, and timer. The implementation should derive Cosmo copy and tone from existing state rather than adding a parallel state machine.

Recommended derived UI model:

- `tone`: visual state for the avatar and panel.
- `headline`: short Cosmo sentence.
- `detail`: one supporting teaching or rescue sentence.
- `primaryActionLabel`: optional mode-specific command label.

This can live as a pure helper that receives the current game state and active cargo, then returns display copy. Keeping it pure makes it easier to test and avoids scattering feedback copy through JSX.

## Component Shape

Expected implementation boundaries:

- `src/components/CosmoCoach.tsx`: large avatar plus feedback panel.
- `src/components/CosmoCoach.test.tsx`: rendering and state-copy tests.
- `src/components/CargoBelt.tsx`: compact Rescue Rush queue presentation.
- `src/components/MissionBoard.tsx`: mode-specific layout wiring.
- `src/components/TeacherControls.tsx`: command dock labels and layout support.
- `src/domain/cosmoFeedback.ts`: pure state-to-copy helper.
- `src/domain/cosmoFeedback.test.ts`: tone and message coverage.
- `src/styles.css`: responsive layout, Cosmo panel, command dock, cargo belt, and no-scroll safeguards.
- `e2e/mission-board.spec.ts`: browser checks for prominent Cosmo, compact bins, Practice evidence flow, Rescue Rush cargo-in-board layout, and no overflow.

If the current `RescueMascot` component is still useful, it can be refactored or replaced by `CosmoCoach`. The implementation should avoid keeping two competing mascot surfaces.

## Visual Direction

The screen should feel like a bright classroom space-cargo bay. Use the existing blue, green, and orange classification palette, but give Cosmo a stronger high-contrast communication surface.

Recommended hierarchy:

1. Current mode, timer or cargo progress, and score.
2. Active cargo and Cosmo feedback.
3. Sorting bins.
4. Teacher command dock.
5. Upcoming cargo.

The board should not be dominated by empty space. The bins can be compact as long as touch targets remain large and labels fit.

## Testing Strategy

Unit tests should cover:

- Cosmo feedback copy for Practice initial, class-check, hint, correct reveal, wrong reveal, Rescue Rush ready, damaged, repair, paused, and complete states.
- Command label changes, especially `Ask For Evidence` in Practice Mode.
- Cargo belt renders upcoming cargo without changing cargo order or classification behavior.

Browser tests should cover:

- In Practice Mode, Cosmo is prominent and asks for evidence before reveal.
- In Rescue Rush, active cargo is visually inside or immediately above the rescue board.
- Cosmo warning appears after a wrong Rescue Rush drop.
- The board still fits without document scroll in the existing viewport set.
- Key labels fit inside Cosmo panel, command dock, bins, and cargo belt.

Manual visual checks should compare:

- Large classroom viewport.
- In-app browser narrow viewport.
- Practice Mode before and after a class-check drop.
- Rescue Rush before and after a wrong drop.

## Out Of Scope

- Splitting mixture into homogeneous and heterogeneous.
- Adding new chemistry categories.
- Adding backend persistence, student accounts, or teacher dashboards.
- Adding a level map, power-ups, or full arcade progression.
- Replacing the app with canvas or WebGL.
- Writing long mascot dialogue.
