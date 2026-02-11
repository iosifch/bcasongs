# Dev Server — Start the development environment

## Purpose
Start the local development environment by launching the Vue.js application inside a Docker container in background mode. The app will be served with hot-reload via Vite.

## Prerequisites
- Docker Engine must be installed and running
- Docker Compose v2+ must be available (`docker compose` — without hyphen)
- Port **5173** must be free on the host machine

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
If the `app` service is already in `running` state, **do not restart it**. Inform the user that the dev server is already active.

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

## Expected outcome
- The dev server is accessible at `http://localhost:5173`
- Hot-reload is active — file changes are reflected immediately in the browser
- The container runs in background and does not block the terminal

## Stopping the dev server
```bash
docker compose down
```
