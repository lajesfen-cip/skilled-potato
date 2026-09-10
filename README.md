# Skilled Potato 🥔

Curated Claude Code skills, installable one at a time into any project via the `potato` CLI.

## Install the CLI

```
npm install -g git+https://github.com/lajesfen-cip/skilled-potato.git
```

## Usage

```
potato list                          # see all skills available in the catalog
potato list --local                  # see skills installed in the current project
potato list --global                 # see skills installed globally (~/.claude/skills/)

potato add check-existing-code       # install into the current project's .claude/skills/
potato add check-existing-code -g    # install into ~/.claude/skills/ instead

potato update check-existing-code    # update one installed skill to the latest version
potato update --all                  # update every outdated installed skill
potato update check-existing-code -g # same, but against the global install

potato remove check-existing-code    # remove an installed skill (asks for confirmation)
potato remove check-existing-code -y # skip the confirmation prompt
```

`add`/`update` fetch only the files listed in that skill's `skill.json` — no full clone.
Pass `-g`/`--global` to any of `add`/`remove`/`update` to target `~/.claude/skills/`
instead of the current project. Destructive actions (`remove`, or `add`/`update`
overwriting an existing install) ask for confirmation unless `-y`/`--yes` is passed.

## Development

Dev tooling uses [bun](https://bun.sh) (package manager + running TypeScript directly,
no separate transpile step needed). The published CLI itself still targets plain
Node — end users installing `potato` don't need bun installed.

```
bun install
bun run dev               # run the CLI directly from TypeScript source (no build step)
bun run build             # compile src -> dist (tsc)
bun run lint              # check formatting/lint rules with Biome
bun run lint:fix          # apply Biome's safe fixes
bun run generate-manifest # regenerate skills/manifest.json from skills/*/skill.json
```

The `prepare` script (invoked automatically on `npm install`/`npm install -g` for
end users, and on `bun install` here) builds `dist/`.
CI (`.github/workflows/ci.yml`) runs lint, build, and a check that
`skills/manifest.json` is up to date on every push/PR to `main`.

Skill content lives in `skills/<name>/` at the repo root (each with a `SKILL.md`
and a `skill.json` manifest). This repo does not use its own skills — it's the
source the CLI copies from, nothing more.

`skills/manifest.json` aggregates every skill's `skill.json` into one file, so
`potato list`/`add`/`update` only need a single request to know the whole
catalog instead of one request per skill. **After adding, removing, or editing
a skill, run `bun run generate-manifest` and commit the result** — CI fails the
build if the manifest drifts out of sync with the individual `skill.json` files.