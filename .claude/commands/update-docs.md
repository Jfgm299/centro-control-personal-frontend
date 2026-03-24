---
allowed-tools: Bash(git diff:*), Bash(git log:*), Read, Edit, Write, Glob
description: Analyze recent changes and update documentation in `.claude/docs/`
---

## Context

- Changed files vs develop: !`git diff develop..HEAD --name-only`
- Recent commits (for context on why things changed): !`git log develop..HEAD --oneline`

## Task

Analyze the changed files above and update the relevant docs in `.claude/docs/` to reflect the current state of the code.

## Mapping: changed file → doc to update

| If this changed... | Update... |
|---|---|
| `src/pages/<mod>/index.js` | `docs/modules/<mod>.md` + `docs/modules/README.md` |
| `src/pages/<mod>/hooks/` | `docs/modules/<mod>.md` — State / Key Behaviour sections |
| `src/pages/<mod>/store/` | `docs/modules/<mod>.md` + `docs/state-management.md` |
| `src/pages/<mod>/components/` | `docs/modules/<mod>.md` — Structure section (if the component tree changed) |
| `src/pages/<mod>/services/` | `docs/modules/<mod>.md` — Backend Endpoints section |
| `src/lib/createApiClient.js` | `docs/architecture.md` — API Client section |
| `src/lib/moduleLoader.js` | `docs/architecture.md` — Module System section |
| `src/hooks/useIsMobile.js` | `docs/architecture.md` — Responsive Pattern section |
| `src/store/` (global stores) | `docs/state-management.md` |
| `src/i18n/locales/` | `docs/modules/<mod>.md` — note new/changed translation keys if relevant |
| New complete module | Create `docs/modules/<mod>.md` + add row in `docs/modules/README.md` |

## Process

1. Read the changed files to understand exactly what changed (not just file names)
2. Cross-reference with the mapping above to determine which docs need updates
3. Edit only the affected sections — do not rewrite sections that didn't change
4. Confirm which files were updated and what changed in each

## Backend-affecting changes

If the change introduces new endpoints the frontend consumes, or changes how existing ones are used, also update:
- `docs/shared-context.md` in this repo
- `centro-control/.claude/docs/shared-context.md` in the backend repo (if it exists)
