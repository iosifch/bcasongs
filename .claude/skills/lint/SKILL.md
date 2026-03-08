---
name: lint
description: Run ESLint inside the Docker container to check or fix code style issues.
disable-model-invocation: true
allowed-tools: Bash(docker compose exec *)
argument-hint: "[run|fix]"
---

Run ESLint inside the Docker container.

## Available actions

| Action | Command                                      |
|:-------|:---------------------------------------------|
| `run`  | `docker compose exec app npm run lint`       |
| `fix`  | `docker compose exec app npm run lint:fix`   |

## Instructions

- If the user provides an argument (e.g., `/lint fix`), execute that action directly.
- If no argument is provided, default to `run`.
- Always show the command output to the user.

User action: $ARGUMENTS
