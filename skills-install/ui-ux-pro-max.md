# ui-ux-pro-max

UI/UX design reference for web, mobile and desktop, with a searchable local database: 79 styles, 192 palettes, 74 font pairings, 119 UX guidelines, 25 chart types and 22 stacks (Next.js, React, Tailwind, shadcn/ui and more). Use it when designing, building or reviewing pages, components, colour, type, layout or accessibility.

| | |
|---|---|
| Repo | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) |
| Folder in repo | `.claude/skills/ui-ux-pro-max` |
| Installs to | `~/.claude/skills/ui-ux-pro-max` |
| Version | `3a13158` (2026-11-01, v2.15.0) |

## Requirements

- git
- Python 3 (standard library only)

No API keys needed. Works on its own; the other skills from this repo are optional.

## Install

```bash
DEST="$HOME/.claude/skills"
SRC="$(mktemp -d)"
git clone --depth 1 https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git "$SRC/repo"
mkdir -p "$DEST"
cp -R "$SRC/repo/.claude/skills/ui-ux-pro-max" "$DEST/ui-ux-pro-max"
rm -rf "$SRC"
```

## Check

```bash
python3 ~/.claude/skills/ui-ux-pro-max/scripts/search.py "portfolio minimal" --domain style -n 1
```

It should print a result such as "Minimalism & Swiss Style". Then start a new Claude Code session and run `/ui-ux-pro-max`.

## Install as a plugin instead

To get updates automatically, install the plugin instead of copying the folder. It installs this skill together with the repo's six others (`design`, `banner-design`, `ui-styling`, `brand`, `slides`, `design-system`). Run these inside Claude Code:

```
/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
/plugin install ui-ux-pro-max@ui-ux-pro-max-skill
```

Or use the repo's CLI: `npm install -g ui-ux-pro-max-cli`, then `uipro init --ai claude --global`.

## Update / uninstall

```bash
rm -rf ~/.claude/skills/ui-ux-pro-max
```

To update, uninstall, then run the install steps again.
