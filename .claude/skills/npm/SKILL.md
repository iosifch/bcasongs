---
name: npm
description: Manage npm packages inside the Docker container. Use for installing, uninstalling, or auditing dependencies.
disable-model-invocation: true
allowed-tools: Bash(docker compose exec *)
argument-hint: "[install|uninstall|audit] [package_name]"
---

Manage npm packages inside the Docker container.

## Available actions

| Action      | Command                                              |
|:------------|:-----------------------------------------------------|
| `install`   | `docker compose exec app npm install <package_name>` |
| `uninstall` | `docker compose exec app npm uninstall <package_name>` |
| `audit`     | `docker compose exec app npm audit`                  |

- If called without a package name (e.g., `/npm install`), run `docker compose exec app npm install` to install all dependencies.

## Instructions

- If the user provides an argument (e.g., `/npm install lodash`), execute that action directly.
- If no argument is provided, show the available actions and ask which one to run.
- Always show the command output to the user.

User action: $ARGUMENTS
