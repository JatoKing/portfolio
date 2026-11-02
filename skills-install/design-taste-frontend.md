# design-taste-frontend

Art direction for websites, from taste-skill v2. It picks a researched direction (composition, type, palette, photos, section layouts), builds the page, then screenshots it in a real browser and fixes what looks generic or "AI-made". Covers landing pages, portfolios, product pages and app screens such as dashboards.

| | |
|---|---|
| Repo | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) |
| Folder in repo | `skills/taste-skill` |
| Installs to | `~/.claude/skills/design-taste-frontend` |
| Version | `12af471` (2026-10-25) |

## Requirements

- git
- Node.js 22+
- Chrome, Edge or Chromium, for the page inspector and screenshots
- Network access, to find stock photos

No API keys needed.

## Install

```bash
DEST="$HOME/.claude/skills"
SRC="$(mktemp -d)"
git clone --depth 1 https://github.com/Leonxlnx/taste-skill.git "$SRC/repo"
mkdir -p "$DEST"
cp -R "$SRC/repo/skills/taste-skill" "$DEST/design-taste-frontend"
rm -rf "$SRC"
```

The repo folder is called `taste-skill`, but the skill's name is `design-taste-frontend`, so it is copied under that name.

## Check

```bash
ls ~/.claude/skills/design-taste-frontend/SKILL.md
```

Start a new Claude Code session and run `/design-taste-frontend`.

## What its scripts do

- Download images from public archives (Openverse, NASA, the Met, Wikimedia).
- Launch your local Chrome to screenshot and inspect pages.
- Keep a history file at `~/.taste-skill/history.json`.

## Install as a plugin instead

To get updates automatically, install the plugin instead of copying the folder, by running these inside Claude Code:

```
/plugin marketplace add Leonxlnx/taste-skill
/plugin install taste-skill@taste-skill
```

Update later with `/plugin update`. The plugin version is named `taste-skill:...`, so remove the copied folder first to avoid having it twice.

## Update / uninstall

```bash
rm -rf ~/.claude/skills/design-taste-frontend
```

To update, uninstall, then run the install steps again.
