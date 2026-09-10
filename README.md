# Skilled Potato 🥔

Curated Claude Code skills, installable one at a time into any project via the `potato` CLI.

## Install the CLI

```
npm install -g git+https://github.com/lajesfen-cip/skilled-potato.git
```

## Usage

```
potato list                     # see available skills
potato add check-existing-code  # copies skills/check-existing-code/ into the current project's .claude/skills/
```

`add` fetches only the files listed in that skill's `skill.json` — no full clone.

## Development

This is a TypeScript project, kept to a single source file: `src/index.ts`. It compiles to `dist/index.js`, which is exactly what the `potato` bin points at.

```
npm install
npm run dev      # run the CLI directly from TypeScript source (no build step)
npm run build    # compile src/index.ts -> dist/index.js
```

`npm run prepare` (invoked automatically on `npm install`/`npm install -g`) builds `dist/`.

Skill content lives in `skills/<name>/` at the repo root (each with a `SKILL.md` and a `skill.json` manifest). This repo does not use its own skills — it's the source the CLI copies from, nothing more.