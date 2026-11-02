# design-motion-principles

Motion and interaction design, based on the techniques of Emil Kowalski, Jakub Krehel and Jhey Tompkins. It has two modes: build components with purposeful motion, or audit existing animations and produce an HTML report with looping demos. Covers transitions, hover states, micro-interactions and enter/exit animations in React, Framer Motion, CSS or HTML.

| | |
|---|---|
| Repo | [kylezantos/design-motion-principles](https://github.com/kylezantos/design-motion-principles) |
| Folder in repo | `skills/design-motion-principles` |
| Installs to | `~/.claude/skills/design-motion-principles` |
| Version | `4a9ca87` (2026-05-30) |

## Requirements

- git

Instructions and reference files only: no scripts and no API keys.

## Install

```bash
DEST="$HOME/.claude/skills"
SRC="$(mktemp -d)"
git clone --depth 1 https://github.com/kylezantos/design-motion-principles.git "$SRC/repo"
mkdir -p "$DEST"
cp -R "$SRC/repo/skills/design-motion-principles" "$DEST/design-motion-principles"
rm -rf "$SRC"
```

## Check

```bash
ls ~/.claude/skills/design-motion-principles/SKILL.md
```

Start a new Claude Code session and run `/design-motion-principles`.

## Update / uninstall

```bash
rm -rf ~/.claude/skills/design-motion-principles
```

To update, uninstall, then run the install steps again.
