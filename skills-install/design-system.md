# design-system

Design tokens and component specs from UI/UX Pro Max. It organises tokens in three layers (primitive → semantic → component) and builds CSS variables plus spacing and type scales. It also generates brand-consistent slides.

| | |
|---|---|
| Repo | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) |
| Folder in repo | `.claude/skills/design-system` |
| Installs to | `~/.claude/skills/design-system` |
| Version | `3a13158` (2026-11-01, v2.15.0) |

## Requirements

- git
- Python 3
- Node.js, for its token generation and validation scripts

No API keys needed. Works on its own; it pairs well with `brand` and `ui-styling`.

## Install

```bash
DEST="$HOME/.claude/skills"
SRC="$(mktemp -d)"
git clone --depth 1 https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git "$SRC/repo"
mkdir -p "$DEST"
cp -R "$SRC/repo/.claude/skills/design-system" "$DEST/design-system"
rm -rf "$SRC"
```

## Check

```bash
ls ~/.claude/skills/design-system/SKILL.md
```

Start a new Claude Code session and run `/design-system`.

## What its scripts do

When asked for a background image for a slide, it builds a Pexels search link. It doesn't download anything itself.

## Update / uninstall

```bash
rm -rf ~/.claude/skills/design-system
```

The `slides` and `design` skills need `design-system`; uninstall them too if you remove it. To update, uninstall, then run the install steps again.
