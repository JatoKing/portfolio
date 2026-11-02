# slides

HTML presentations from UI/UX Pro Max: Chart.js charts, design tokens, responsive layouts, copywriting formulas and slide strategies (for example investor pitches).

| | |
|---|---|
| Repo | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) |
| Folder in repo | `.claude/skills/slides` |
| Installs to | `~/.claude/skills/slides` |
| Version | `3a13158` (2026-11-01, v2.15.0) |

## Requirements

- git
- Python 3
- **Other skill:** `design-system`. Slide strategy, layout and copy searches run its `search-slides.py` script. The install below adds it if it is missing.

No API keys needed.

## Install

```bash
DEST="$HOME/.claude/skills"
SRC="$(mktemp -d)"
git clone --depth 1 https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git "$SRC/repo"
mkdir -p "$DEST"
for n in slides design-system; do
  if [ -e "$DEST/$n" ]; then echo "skip: $n is already installed"
  else cp -R "$SRC/repo/.claude/skills/$n" "$DEST/$n"; fi
done
rm -rf "$SRC"
```

## Check

```bash
ls ~/.claude/skills/{slides,design-system}/SKILL.md
```

Start a new Claude Code session and run `/slides`.

## Update / uninstall

```bash
rm -rf ~/.claude/skills/slides
```

This leaves `design-system` in place; remove it separately if nothing else needs it. To update, uninstall, then run the install steps again.
