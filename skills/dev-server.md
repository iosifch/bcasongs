---
name: Dev Server
description: Start the local development environment with Docker Compose (Vite + hot-reload)
tags: [docker, dev, vite, server]
---

# Dev Server — Start the development environment

## Purpose
Start the local development environment by launching the Vue.js application inside a Docker container in background mode. The app will be served with hot-reload via Vite.

## Triggers
Invoke this skill when the user:
- Asks to "start the app", "run the dev server", or "start Docker"
- Wants to preview changes locally and the server is not running
- Another skill (e.g., unit-tests) requires the container to be running

## Execution environment
Commands run on the **host machine** (not inside Docker).
- **Required**: Docker Engine running, Docker Compose v2+
- **Port**: 5173 must be free on the host

## Steps

### 1. Verify Docker is running
```bash
docker info > /dev/null 2>&1
```
If this command fails, Docker is not running. Inform the user to start Docker Desktop or the Docker daemon.

### 2. Check if the dev server is already running
```bash
docker compose ps --format json
```
If the `app` service is already in `running` state:
1. **Do not restart it**.
2. Proceed to verification or inform the user it's already active.

### 2.5. Ensure dependencies are installed
**Important**: Since the project uses a volume mount (`.:/app`), `node_modules` must exist on the host or be installed inside the running container.

If starting for the first time or after `package.json` changes:
```bash
docker compose exec app npm install
```

### 3. Build and start in background
```bash
docker compose up -d --build
```
- `up` — creates and starts the containers
- `-d` — detached mode (background)
- `--build` — rebuilds the image if the Dockerfile or build context has changed

### 4. Verify the dev server is up
```bash
docker compose ps
```
Confirm that the `app` service is in `running` state and port 5173 is mapped.

### 5. Check logs (optional, for troubleshooting)
```bash
docker compose logs --tail=30 app
```

## Output format
Report to the user:
- ✅ **Status**: Container running / failed
- 🌐 **URL**: `http://localhost:5173`
- ⚠️ **Warnings**: Any relevant build warnings from logs

## Stopping the dev server
```bash
docker compose down
```

## Related skills
- [npm-check.md](npm-check.md) — verify dependencies health
- [unit-tests.md](unit-tests.md) — run tests inside the container
