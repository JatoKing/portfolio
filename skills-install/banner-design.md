# banner-design

Banner design from UI/UX Pro Max, for social media, ads, website heroes and print. It offers several art directions (minimalist, gradient, bold type, photo-based, glassmorphism, 3D, retro and more) at the right size for each platform: Facebook, X, LinkedIn, YouTube, Instagram, Google Display or print.

| | |
|---|---|
| Repo | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) |
| Folder in repo | `.claude/skills/banner-design` |
| Installs to | `~/.claude/skills/banner-design` |
| Version | `3a13158` (2026-11-01, v2.15.0) |

## Requirements

- git

Instructions and a size and style reference only: no scripts and no API keys. Works on its own.

## Install

```bash
DEST="$HOME/.claude/skills"
SRC="$(mktemp -d)"
git clone --depth 1 https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git "$SRC/repo"
mkdir -p "$DEST"
cp -R "$SRC/repo/.claude/skills/banner-design" "$DEST/banner-design"
rm -rf "$SRC"
```

## Check

```bash
ls ~/.claude/skills/banner-design/SKILL.md
```

Start a new Claude Code session and run `/banner-design`.

## Update / uninstall

```bash
rm -rf ~/.claude/skills/banner-design
```

To update, uninstall, then run the install steps again.
