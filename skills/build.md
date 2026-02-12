---
name: Build App
description: Create a production-ready build of the Vue.js application
tags: [build, vite, production]
---

# Build App — Create production build

## Purpose
Compile and optimize the Vue.js application for production deployment. This generates static assets in the `dist/` directory.

## Triggers
Invoke this skill when the user:
- Asks to "build the app" or "prepare for production"
- Wants to verify that the app compiles without errors
- Before running deployment steps manually

## Execution environment
The build command runs **inside the Docker container** to ensure environment consistency.

```bash
docker compose exec app <command>
```

## Steps

### 1. Ensure dependencies are up to date
```bash
docker compose exec app npm install
```
Strictly necessary to avoid build errors due to missing packages.

### 2. Run the build command
```bash
docker compose exec app npm run build
```
This runs `vite build`, which:
- Compiles Vue templates and scripts
- Optimizes assets (minification, tree-shaking)
- Generates the service worker for PWA
- Outputs files to `dist/`

### If the command fails
Common errors:
- **Memory limit**: The container might run out of memory.
- **Micro-syntax errors**: Type errors or lint issues preventing build.
- **Container not running**: Follow `dev-server.md` to start it.

### 3. Verify the build output
Check if the `dist/` directory was populated on the host (since it is mounted):
```bash
ls -la dist/index.html
```

## Output format
Report to the user:
- ✅ **Success**: Build completed in X seconds
- 📁 **Output**: Location of artifacts (`dist/` folder)
- ❌ **Errors**: Specific compilation errors if any

## Related skills
- [dev-server.md](dev-server.md) — container must be running
- [deploy.md](deploy.md) — usually follows the build step
