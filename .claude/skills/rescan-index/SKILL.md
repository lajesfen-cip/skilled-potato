---
name: rescan-index
description: Rebuild the function index at .claude/function-index.md by scanning the codebase for functions, classes, and their locations. Use when explicitly asked to rescan/rebuild the index, or when check-existing-code finds the index missing or clearly out of date.
---

# Rescan codebase and rebuild the function index

Produces `.claude/function-index.md`, a flat map of every function/class in the project so future lookups don't require re-reading the whole codebase.

The mechanical part (finding every function/class and its file:line) is done by a deterministic script, not by reading the codebase yourself — this is what makes the index reliable to regenerate. Descriptions and the `reusable` flag still need a model, since those require understanding what the code does.

## Steps

1. Run the scanner: `node .claude/skills/rescan-index/scan.js` from the repo root. It walks the codebase (skipping `.gitignore`d and common build/dependency dirs) and prints a JSON array of `{file, line, name, kind, signature}` — one entry per function/class it found via regex, across JS/TS, Python, Go, Ruby, PHP, Java, and C#.
2. Read the existing `.claude/function-index.md`, if present. For each scanned entry that matches an existing one (same file + name, line close enough that it's clearly the same function), carry over its description and `reusable` flag instead of re-deriving them.
3. For any entry that's new or has no prior match, open the relevant file and write:
   - one-line description of what it does (infer from the code, not just the name)
   - `reusable: yes` if it's a generic/shared helper already used from more than one place, or written as a standalone utility; otherwise omit
4. Note the scanner's known gaps: it's regex-based, not a real parser, so it can miss deeply nested/anonymous functions, unusual syntax, or languages it doesn't cover. Don't claim full coverage — mention any file types the scanner skipped (e.g. an unlisted extension) if that's relevant to what was asked.
5. Write the result to `.claude/function-index.md`, grouped by file, e.g.:

   ```
   # Function Index
   Regenerate with the rescan-index skill. Last built: <describe briefly, e.g. after commit X or "manual run">

   ## src/utils/email.ts
   - sendEmail(to, subject, body) — src/utils/email.ts:12 — sends an email via AWS SES — reusable: yes

   ## src/api/users.ts
   - getUser(id) — src/api/users.ts:8 — fetches a user record from the DB
   ```

6. Overwrite the existing index file entirely — this is a full rebuild, not an incremental patch.
7. Report a short summary (files scanned, functions indexed, any skipped file types) — don't dump the whole file into chat.

This file is a working cache for Claude, not project documentation — it doesn't belong in `ARCHITECTURE.md` and isn't meant for human reading, though Luciano can open it if useful.
