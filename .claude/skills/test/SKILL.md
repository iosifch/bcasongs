---
name: test
description: Run tests for this application using Vitest inside the Docker container.
disable-model-invocation: true
allowed-tools: Bash(docker compose exec *)
argument-hint: "[watch|run]"
---

Run tests using Vitest inside the Docker container.

## Available actions

| Action  | Command                                    |
|:--------|:-------------------------------------------|
| `watch` | `docker compose exec app npm test`         |
| `run`   | `docker compose exec app npm run test:run` |

## Instructions

- If the user provides an argument (e.g., `/test run`), execute that action directly.
- If no argument is provided, default to `run` (single run).
- Always show the command output to the user.

User action: $ARGUMENTS
