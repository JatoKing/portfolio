# design

All-round design skill from UI/UX Pro Max: logos (55 styles), icons, corporate identity sets with mockups, banners, social media images and HTML presentations. Logo, icon and mockup generation uses AI image models (Gemini, MuAPI or AtlasCloud).

| | |
|---|---|
| Repo | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) |
| Folder in repo | `.claude/skills/design` |
| Installs to | `~/.claude/skills/design` |
| Version | `3a13158` (2026-11-01, v2.15.0) |

## Requirements

- git
- Python 3
- **Other skills:** `ui-ux-pro-max`, `brand` and `design-system`. `design` runs scripts from inside those folders and hands parts of its work to them. The install below adds any of them that are missing.
- Optional, for AI image generation only: `pip install google-genai pillow` and an API key (see below).

## Install

```bash
DEST="$HOME/.claude/skills"
SRC="$(mktemp -d)"
git clone --depth 1 https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git "$SRC/repo"
mkdir -p "$DEST"
for n in design ui-ux-pro-max brand design-system; do
  if [ -e "$DEST/$n" ]; then echo "skip: $n is already installed"
  else cp -R "$SRC/repo/.claude/skills/$n" "$DEST/$n"; fi
done
rm -rf "$SRC"
```

## API keys (optional)

Only logo, icon and mockup generation needs a key. The skill reads one of `GEMINI_API_KEY` (or `GOOGLE_API_KEY`), `MUAPI_API_KEY` or `ATLASCLOUD_API_KEY` from your environment. If it isn't set there, it also looks in `~/.claude/skills/.env` and `~/.claude/.env`:

```bash
# ~/.claude/.env
GEMINI_API_KEY=your-key-here
```

The prompts you give for those images are sent to the provider whose key you set.

## Check

```bash
ls ~/.claude/skills/{design,ui-ux-pro-max,brand,design-system}/SKILL.md
```

Start a new Claude Code session and run `/design`.

## Update / uninstall

```bash
rm -rf ~/.claude/skills/design
```

This leaves `ui-ux-pro-max`, `brand` and `design-system` in place; remove them separately if nothing else needs them. To update, uninstall, then run the install steps again.
