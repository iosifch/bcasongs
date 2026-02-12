---
name: NPM Check
description: Audit and verify npm packages for security vulnerabilities, outdated dependencies, and integrity issues
tags: [npm, security, dependencies, audit]
---

# NPM Check — Verify npm packages health

## Purpose
Audit and verify the health, security, and freshness of npm packages installed in the project.

## Triggers
Invoke this skill when the user:
- Asks to "check packages", "audit dependencies", or "check for updates"
- Encounters dependency-related errors
- Before starting a major refactor or feature implementation

## Execution environment
All npm commands **must be run inside the Docker container** using `docker compose exec`:

```bash
docker compose exec app <command>
```

## Steps

### 1. Verify node_modules are installed
```bash
docker compose exec app npm ls --depth=0 2>&1
```
If `node_modules/` is missing or incomplete, run `docker compose exec app npm install` first.

### If the command fails with a container error
If step 1 fails with an error like `no container found` or `service "app" is not running`, the Docker container is not started. In this case:

1. **Start the dev server** by following the `skills/dev-server.md` skill
2. **Retry** from step 1

### 2. Check for security vulnerabilities
```bash
docker compose exec app npm audit
```
- Review any vulnerabilities reported (low, moderate, high, critical)
- If vulnerabilities are found, suggest running `docker compose exec app npm audit fix`
- For breaking changes, inform the user before running `npm audit fix --force`

### 3. Check for outdated packages
```bash
docker compose exec app npm outdated
```
This shows a table with:
- **Current** — currently installed version
- **Wanted** — latest version matching the semver range in `package.json`
- **Latest** — latest version available on the registry

Report the results to the user. **Do not auto-update** packages without user approval.

### 4. Verify dependency tree integrity
```bash
docker compose exec app npm ls 2>&1
```
Look for:
- `UNMET PEER DEPENDENCY` warnings
- `missing` dependencies
- Version conflicts

If issues are found, suggest running `docker compose exec app npm install` to resolve them.

### 5. Check for duplicate packages (optional)
```bash
docker compose exec app npm dedupe --dry-run
```
If duplicates are found, suggest running `docker compose exec app npm dedupe` to flatten the dependency tree.

## Summary format
After running all checks, provide a summary:
- **Vulnerabilities**: number and severity
- **Outdated packages**: list with current vs latest version
- **Dependency issues**: any unmet or missing dependencies
- **Recommended actions**: prioritized list of suggested fixes

## Related skills
- [dev-server.md](dev-server.md) — needed if container is not running
- [unit-tests.md](unit-tests.md) — verify code after updates
