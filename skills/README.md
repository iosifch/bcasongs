# Skills Index

This directory contains the Agent-Agnostic definitions of project skills. These are referenced by agent-specific adapters (e.g., `.gemini/skills/`).

| Skill | Description | Triggers |
|-------|-------------|----------|
| [**dev-server.md**](dev-server.md) | Start Docker development environment | "start app", "run dev" |
| [**unit-tests.md**](unit-tests.md) | Run Vitest unit tests | "run tests", "check code" |
| [**npm-check.md**](npm-check.md) | Audit npm packages & security | "check packages", "audit" |
| [**build.md**](build.md) | Create production build (`dist/`) | "build app", "production build" |
| [**deploy.md**](deploy.md) | Deploy to GitHub Pages via CI | "deploy", "publish" |
| [**generate-icons.md**](generate-icons.md) | Generate PWA icons from SVG | "generate icons", "update icon" |

## Architecture
- **Source**: `skills/*.md` (This directory) — The single source of truth.
- **Adapters**: `.gemini/skills/*/SKILL.md` — Agent-specific wrappers that point to these files.

To add a new skill:
1. Create `skills/new-skill.md`
2. Create `.gemini/skills/new-skill/SKILL.md` referencing it
