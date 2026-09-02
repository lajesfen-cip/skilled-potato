---
name: check-existing-code
description: Search the codebase for existing implementations, similar functions, or reusable logic before writing new code. Use before adding any new function, module, file, or feature, or when asked to check for duplicates or reuse opportunities.
---

# Check existing code before adding new code

Run this before writing any new function, module, class, or file.

## Steps

1. Identify what the new code is meant to do — the core behavior, not the proposed name. Note likely synonyms (e.g. "fetch", "get", "load" for a data-retrieval function).
2. Check `.claude/function-index.md` first:
   - If it doesn't exist, or looks clearly stale (missing recently-added files, or the codebase has changed a lot since it was built), invoke the `rescan-index` skill to (re)build it, then continue.
   - Scan the index for matches on the behavior and its synonyms — this is a flat lookup, not a codebase read, so it's cheap.
3. Only fall back to a live search if the index doesn't cover the area in question (e.g. a file type it skips, or something added since the last rescan):
   - Grep for the behavior's likely keywords, not just the exact name you were about to give it.
   - Glob for files in areas of the codebase where this logic would naturally live.
   - Check for existing utilities, helpers, or shared modules that overlap in purpose.
4. Classify what you find, if anything:
   - **Exact match** — the functionality already exists. Use it directly; do not write new code.
   - **Close match** — something does most of this already. Prefer extending or parameterizing it over duplicating it.
   - **No match** — nothing found. Proceed to write new code.
5. Report findings before writing anything:
   - What you searched for and where (index, live search, or both).
   - What you found (file:line references), or confirmation nothing overlapping exists.
   - Your recommendation (reuse / extend / write new) and why.
6. Only write new code after this check, and only for the "no match" or "close match → extend" outcomes. If you find duplicate logic already present elsewhere in the codebase (not just relevant to the current task), flag it — don't silently add a third copy.
7. If you wrote new code, note that `.claude/function-index.md` is now stale for the affected file(s) — mention it, don't rescan automatically unless asked.
