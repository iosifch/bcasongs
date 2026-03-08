---
name: docker
description: Manage the Docker container for this application. Use when starting, stopping, restarting, viewing logs, or running commands inside the container.
disable-model-invocation: true
allowed-tools: Bash(docker compose *)
argument-hint: "[up|stop|restart|down|status|logs|build|rebuild|shell|install]"
---

Manage the Docker container for this application. The service is named `app` in `docker-compose.yml`.

## Available actions

| Action      | Command                                                                          |
|:------------|:---------------------------------------------------------------------------------|
| `up`        | `docker compose up -d`                                                           |
| `stop`      | `docker compose stop`                                                            |
| `restart`   | `docker compose restart`                                                         |
| `down`      | `docker compose down`                                                            |
| `status`    | `docker compose ps`                                                              |
| `logs`      | `docker compose logs --tail=50 app`                                              |
| `build`     | `docker compose build`                                                           |
| `rebuild`   | `docker compose down && docker compose build --no-cache && docker compose up -d` |
| `shell`     | `docker compose exec app sh`                                                     |

## Instructions

- If the user provides an argument (e.g., `/docker logs`), execute that action directly.
- If no argument is provided, show the available actions and ask which one to run.
- Always show the command output to the user.

User action: $ARGUMENTS
