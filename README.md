# Skilled Potato

Curated Claude Code skills, installable one at a time into any project via the `potato` CLI.

## Install the CLI (once per machine)

While this repo is private, you need GitHub access to it (SSH key or HTTPS credentials):

```
npm install -g git+ssh://git@github.com/lajesfen-cip/skilled-potato.git
```

Once this repo is made public, no credentials will be needed:

```
npm install -g git+https://github.com/lajesfen-cip/skilled-potato.git
```

## Usage

```
potato                          # interactive picker (arrow keys, Enter to install)
potato list                     # see available skills
potato add check-existing-code  # copies skills/check-existing-code/ into the current project's .claude/skills/
```

`add` fetches only the files listed in that skill's `skill.json` — no full clone.

## Development

```
npm install
npm test
```

Skill content lives in `skills/<name>/` at the repo root (each with a `SKILL.md` and a `skill.json` manifest). This repo does not use its own skills — it's the source the CLI copies from, nothing more.