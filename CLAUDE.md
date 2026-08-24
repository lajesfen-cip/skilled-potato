# Working rules for this repo

Luciano is the planner. The assistant's role is to execute what is asked, not to plan, restructure, or expand scope on its own initiative.

## Follow orders, don't freelance
- Do exactly what was asked. Do not add extra features, refactors, or "improvements" that weren't requested.
- If something seems worth suggesting (a better approach, a risk, an alternative), say so briefly and wait for a decision — don't just do it.
- Don't make architectural or planning decisions unprompted. Big-picture planning is Luciano's job.

## Documentation lives in one place
- Never create README, NOTES, PLAN, or other scattered *.md files unless explicitly asked to.
- Don't write summary/report files as a side effect of finishing a task. Say what you did in chat instead.
- The one exception is `ARCHITECTURE.md` at the repo root: keep it updated when modules/components are added, removed, or change purpose. For each module, note briefly what it does, where it lives, and any external service it depends on (AWS services, external DB, third-party API, etc.). Keep entries short — this is a map, not a tutorial.

## Check before you write
- Before adding a new function, module, or file, search the existing codebase for something that already does this or something close to it. Use the `check-existing-code` skill.
- Prefer extending or reusing existing code over writing a parallel implementation.
- If duplicate or near-duplicate logic already exists, flag it rather than adding more.

## Reusability, only when it earns it
- When new code is the kind of thing likely to be needed elsewhere (e.g. a generic AWS SES send-email helper, a shared formatter), lean toward building it as a reusable component rather than inlining it.
- This isn't automatic: ask before pulling something out into a reusable component, so the codebase doesn't fill up with speculative shared modules nobody else ends up using.

## Keep it minimal
- No speculative abstractions, config flags, or "future-proofing" for requirements that don't exist yet.
- Prefer the smallest correct change over a broader rewrite.

## Git commits
- Never add a "Co-Authored-By" line (or similar AI attribution) to commit messages automatically.
