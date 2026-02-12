---
name: Deploy App
description: Deploy the application to GitHub Pages via CI/CD
tags: [deploy, git, github-pages, ci-cd]
---

# Deploy App — Deploy to GitHub Pages

## Purpose
Trigger a deployment to GitHub Pages by pushing changes to the `main` branch. The actual deployment is handled by the GitHub Actions workflow (`.github/workflows/deploy.yml`).

## Triggers
Invoke this skill when the user:
- Asks to "deploy the app" or "publish the changes"
- Wants to make the latest version live

## Execution environment
Commands run on the **host machine** using `git`.

## Steps

### 1. Verify current branch
```bash
git branch --show-current
```
Deployment only happens from `main`. If on another branch, ask the user if they want to merge into `main`.

### 2. Check for uncommitted changes
```bash
git status --porcelain
```
If there are changes, ask the user to commit them first.

### 3. Push to GitHub
```bash
git push origin main
```
This triggers the `deploy.yml` workflow defined in `.github/workflows/`.

### 4. Monitor Deployment (Optional)
Inform the user they can watch the progress in the "Actions" tab of their GitHub repository.

The workflow performs:
1. `npm ci` (Install dependencies)
2. `npm run test:run` (Run unit tests)
3. `npm run build` (Build the app)
4. Upload to GitHub Pages

## Output format
Report to the user:
- 🚀 **Triggered**: Push successful
- ⏳ **Status**: Deployment queue started
- 🔗 **URL**: The live site will be updated shortly

## Important
- This skill does **not** push from the local `dist/` folder. It relies on the CI pipeline.
- If the CI fails (e.g., tests fail), the site will not be updated.

## Related skills
- [unit-tests.md](unit-tests.md) — run tests locally before pushing to avoid CI failures
- [build.md](build.md) — verify build locally first
