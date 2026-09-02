---
name: spec-driven-tdd
description: Enforce a spec-then-failing-test-then-implementation workflow before writing any new feature or function. Use whenever asked to implement new functionality, not just when explicitly requested.
---

# Spec-driven, test-first workflow

Run this before implementing any new feature, function, or behavior change.

## Steps

1. Write a short spec first — a few sentences in chat, not a separate file: what the feature should do, its inputs/outputs, and edge cases that matter.
2. If requirements are ambiguous, resolve them before continuing — ask only if genuinely blocked; otherwise pick a reasonable default and state it in the spec.
3. Write a failing test that encodes the spec, matching the project's existing test framework and conventions. Check `check-existing-code` first for similar tests already in the codebase before writing a new one.
4. Run the test and confirm it fails for the expected reason, not a syntax error or unrelated failure.
5. Implement the minimum code needed to make the test pass.
6. Run the full test suite, not just the new test, to confirm nothing else broke.
7. Report the spec, the test added (file:line), and confirmation it passes.

This applies to new functionality. It does not apply to pure refactors, config changes, or bug fixes where a reproducing test already exists — for those, go straight to the appropriate test/fix cycle instead of writing a new spec.
