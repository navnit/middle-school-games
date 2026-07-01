# Space Cargo Sorter Design

## Summary

Space Cargo Sorter is a teacher-led touchscreen web game for middle-school chemistry classification. The class routes space cargo into classification bays while learning how atoms, element molecules, compound molecules, and mixtures relate.

The first version prioritizes a simple but polished Mission Board experience: one board, about 20 carefully chosen cargo items, Practice Mode, and Rescue Rush. It supports whole-class co-op and team turns without making team systems the center of the first build.

## Learning Goals

- Distinguish single atoms from molecules and mixtures.
- Recognize that molecules can be made from the same element or from different elements.
- Classify element molecules such as `O2`, `O3`, and `N2`.
- Classify compound molecules such as `H2O`, `CO2`, and `CH4`.
- Classify everyday mixtures such as air, salt water, lemonade, trail mix, soil, and cereal with milk.
- Use short evidence-based explanations instead of only naming a category.

## Core Classification Model

The board has three main bins:

- `Atom`: a single unbonded atom.
- `Molecule`: two or more atoms bonded together.
- `Mixture`: two or more substances together, not chemically bonded into one particle type.

The `Molecule` bin is larger and contains two nested bins:

- `Element Molecule`: bonded atoms of the same element, such as `O2`, `O3`, `N2`, `H2`, and `Cl2`.
- `Compound Molecule`: bonded atoms of different elements, such as `H2O`, `CO2`, `CH4`, and `NH3`.

Mixture stays as one bin in v1. Homogeneous and heterogeneous mixture splitting is intentionally out of scope for the first version.

The nested bin labels should use `Element Molecule` and `Compound Molecule`, not just `Element` and `Compound`. This avoids implying that every element belongs inside the molecule bin; single unbonded atoms such as `He` belong in `Atom`.

## Game Modes

### Practice Mode

Practice Mode is teacher-paced and has no timer. A student places the active cargo item on the board. Before revealing the answer, the teacher asks the class to vote or justify the classification. The teacher then reveals the result and the app shows a short explanation.

Practice Mode is meant to slow the class down enough to discuss evidence:

- Is it a single unbonded atom?
- Is it made of bonded atoms?
- If it is bonded, are the atoms all the same element or different elements?
- Is it a mixture of multiple substances?

### Rescue Rush

Rescue Rush is the faster, fun-play mode. Cargo must be routed before the round ends. Wrong drops do not end the item immediately; the cargo becomes damaged and returns for a second rescue attempt.

This keeps pressure and excitement without making mistakes feel final. A damaged cargo item should have a clear visual state, such as a cracked crate, warning light, or repair marker. If the class rescues it on the second try, it still counts as saved but should be distinguishable from a first-try save.

## Play Styles

Both play styles use the same Mission Board:

- `Co-op`: the whole class works together toward a shared rescue score.
- `Team Turns`: teams alternate turns on the touchscreen, with scoring and current-team labels changing by turn.

Team mode should not require a separate board layout in v1. It should be a lightweight scoring and turn-management layer over the same core interaction.

## Main Screen Layout

The game should be optimized for a large classroom touchscreen.

Top bar:

- Mode selector.
- Round status.
- Co-op or team score.
- Current team indicator when team turns are enabled.
- Pause or round controls.

Cargo area:

- Shows the current active cargo item large enough for a student at the board.
- Shows an upcoming cargo queue.
- Each cargo item can include a real-world label, a formula, and a particle diagram.

Rescue board:

- Three large main drop targets: `Atom`, `Molecule`, and `Mixture`.
- The `Molecule` target is visually larger and contains the nested targets `Element Molecule` and `Compound Molecule`.
- Drop targets need generous touch hit areas and obvious feedback when a cargo item is hovering over them.

Teacher controls:

- `Hint`
- `Reveal`
- `Next Cargo`
- `Undo`
- `Pause`
- Mode and team controls

In Practice Mode, `Reveal` shows the answer after class discussion. In Rescue Rush, the panel also shows timer, damaged cargo count, and rescue progress.

## Cargo Library

The v1 cargo library should contain about 20 high-quality cargo items rather than a large shallow set.

Suggested first set:

- Atoms: `He`, `Ne`, `Ar`, single `C`
- Element molecules: `O2`, `O3`, `N2`, `H2`, `Cl2`
- Compound molecules: `H2O`, `CO2`, `CH4`, `NH3`
- Mixtures: air, salt water, lemonade, trail mix, soil, cereal with milk, ocean water

Each cargo item should include:

- Stable ID.
- Display name.
- Optional formula.
- Particle diagram metadata.
- Correct target bin.
- Short hint.
- Short reveal explanation.
- Optional teacher note for caveats.

For v1, avoid tricky standalone ionic compounds such as solid table salt as a cargo item. `NaCl` is a compound but is not a molecule in the strict sense, and the first board model is intentionally `Atom | Molecule | Mixture`. Salt water is acceptable as a mixture.

## Feedback Rules

Correct drop:

- The cargo glows, docks into the target, and increments progress.
- The reveal explanation can still be shown in Practice Mode.

Practice Mode wrong or uncertain drop:

- The cargo enters a `Class Check` state.
- The teacher asks the class to vote or justify.
- The teacher reveals the correct target and explanation.

Rescue Rush wrong drop:

- The cargo becomes damaged.
- It returns for a second attempt.
- A second correct attempt rescues it with a damaged-rescued status.
- A second wrong attempt moves to a `Repair Dock`, where the teacher can reveal the explanation and manually mark it repaired before continuing.

## Technical Shape

Use React, TypeScript, and Vite for v1. The experience is a touchscreen teaching web app with a lot of UI, teacher controls, explanations, and accessible large touch targets. DOM-based drag/drop and SVG or HTML particle diagrams are a better first fit than a canvas game engine.

Recommended boundaries:

- `content`: cargo library, categories, explanations, and particle diagram metadata.
- `game state`: current mode, queue, active cargo, score, damaged cargo, current team, and reveal state.
- `classification rules`: pure validation functions that check a drop and return feedback.
- `board UI`: cargo cards, drop bins, nested molecule bin, and feedback animation states.
- `teacher controls`: hint, reveal, next, undo, pause, mode, and team controls.

No backend is needed for v1. State can live in the browser during the session.

## V1 Defaults

- App name: `Space Cargo Sorter`.
- Visual direction: bright space cargo bay with clean classroom-readable labels.
- Scoring: first-try rescue is 100 points, damaged rescue is 50 points, teacher-repaired cargo is 0 points.
- Particle diagrams: render as inline SVG or structured HTML so they remain crisp on large touchscreens.
- Second wrong Rescue Rush attempt: move cargo to the `Repair Dock` for teacher explanation and manual repair.

## Testing Strategy

Automated tests should cover:

- Every cargo item has a valid target bin and explanation.
- Classification validation accepts correct drops and rejects wrong drops.
- Practice Mode supports place, class-check, reveal, next, and undo.
- Rescue Rush supports correct rescue, damaged cargo, and second-try rescue.
- Team mode switches turns and tracks scores without changing classification behavior.

Manual or browser-based checks should cover:

- Large touchscreen layout.
- Tablet-sized layout.
- Drag/drop target sizes.
- Nested molecule bin readability.
- No text overflow in cargo cards, bins, or teacher controls.

## Explicitly Out Of Scope For V1

- Homogeneous vs heterogeneous mixture bins.
- A large level system.
- Power-ups, hazards, combos, or deep arcade mechanics.
- Backend accounts, persistence, analytics, or teacher dashboards.
- Strict treatment of ionic compounds as standalone cargo items.
