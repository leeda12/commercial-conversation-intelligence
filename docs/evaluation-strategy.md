# Evaluation strategy

Public Version 1 evaluates deterministic artifact integrity and review-workflow correctness rather than model variability.

## Automated checks

- Every transcript has a unique identifier and one matching analysis.
- Repeated analyzer calls produce equal results and independent object copies.
- Every evidence turn exists and each quotation matches the exact transcript substring and offsets.
- Directly asserted critical facts have evidence.
- Confidence values remain within zero and one.
- All fictional email addresses use `example.com`.
- Export formatters escape commas, quotes, and line breaks correctly.
- User edits are marked, exported, resettable, and never mutate bundled fixtures.
- No persistence or external request mechanism is part of the review workflow.

## Editorial review

Each scenario is reviewed for internal consistency, concise executive communication, direct-versus-inferred labelling, warnings for missing information, correct task ownership, grounded email language, and clearly fictional source material.

## Workflow verification

Tests exercise scenario selection, analysis loading, field editing, evidence navigation, user-edited markers, reset behavior, and all four export formats. Visual verification covers keyboard focus, semantic controls, color contrast, reduced motion, overflow, and desktop, tablet, and mobile layouts.

