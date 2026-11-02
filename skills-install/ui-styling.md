# ui-styling

UI building with shadcn/ui (Radix UI + Tailwind) and Tailwind CSS, from UI/UX Pro Max: accessible components (dialogs, dropdowns, forms, tables), theming, dark mode and responsive layouts. It can also generate Tailwind config files and canvas-based posters.

| | |
|---|---|
| Repo | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) |
| Folder in repo | `.claude/skills/ui-styling` |
| Installs to | `~/.claude/skills/ui-styling` |
| Version | `3a13158` (2026-11-01, v2.15.0) |

## Requirements

- git
- Python 3
- Node.js and npm, for adding shadcn/ui components

No API keys needed. Works on its own.

## Install

```bash
DEST="$HOME/.claude/skills"
SRC="$(mktemp -d)"
git clone --depth 1 https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git "$SRC/repo"
mkdir -p "$DEST"
cp -R "$SRC/repo/.claude/skills/ui-styling" "$DEST/ui-styling"
rm -rf "$SRC"
```

## Check

```bash
ls ~/.claude/skills/ui-styling/SKILL.md
```

Start a new Claude Code session and run `/ui-styling`.

## What its scripts do

When asked to add shadcn/ui components, it runs `npx shadcn add` in your project, which installs the components and their npm dependencies.

## Update / uninstall

```bash
rm -rf ~/.claude/skills/ui-styling
```

To update, uninstall, then run the install steps again.
