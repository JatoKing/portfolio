# brand

Brand voice and identity, from UI/UX Pro Max: tone of voice, messaging frameworks, style guides, brand asset management and consistency checks for marketing content. It can sync brand colours and type into design-token files.

| | |
|---|---|
| Repo | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) |
| Folder in repo | `.claude/skills/brand` |
| Installs to | `~/.claude/skills/brand` |
| Version | `3a13158` (2026-11-01, v2.15.0) |

## Requirements

- git
- Node.js, for its brand-to-token sync and asset check scripts

No API keys needed. Works on its own.

## Install

```bash
DEST="$HOME/.claude/skills"
SRC="$(mktemp -d)"
git clone --depth 1 https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git "$SRC/repo"
mkdir -p "$DEST"
cp -R "$SRC/repo/.claude/skills/brand" "$DEST/brand"
rm -rf "$SRC"
```

## Check

```bash
ls ~/.claude/skills/brand/SKILL.md
```

Start a new Claude Code session and run `/brand`.

## Update / uninstall

```bash
rm -rf ~/.claude/skills/brand
```

The `design` skill needs `brand`; uninstall `design` too if you remove it. To update, uninstall, then run the install steps again.
