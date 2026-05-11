---
name: automations
description: Use this skill when the user asks Nexus to create, update, inspect, start, stop, or template a scheduled prompt automation.
---

# Nexus automations CLI

Use `nexus automations` to manage scheduled prompt automations. An automation stores a name, schedule, prompt, cwd, enabled state, and run history in SQLite.

## Commands

- `nexus automations start` starts the scheduler daemon.
- `nexus automations status` shows daemon state, database path, active runs, next due automations, and latest failures.
- `nexus automations stop` stops the scheduler daemon.
- `nexus automations list` lists automations.
- `nexus automations create <name> --schedule <cron|shorthand> --prompt <prompt> [--cwd <path>]` creates an automation.
- `nexus automations edit <id|name> [--name <name>] [--schedule <cron|shorthand>] [--prompt <prompt>] [--cwd <path>]` updates an automation.
- `nexus automations delete <id|name>` deletes an automation and its run history.
- `nexus automations templates list` lists bundled templates.
- `nexus automations templates use <template-id> --name <name> --schedule <cron|shorthand> --yes` creates from a bundled template without opening an editor.

## Schedule examples

- `every 4h`
- `every 30m`
- `daily`
- `daily at 9am`
- `weekdays at 9am`
- `0 9 * * 1-5`

## Natural-language mapping

When the user asks to create an automation, translate their request into the CLI. Example:

```bash
nexus automations create "daily monitor" --schedule "every 4h" --prompt "<prompt content>" --cwd "$PWD"
```

When the user asks to update an automation schedule, use edit:

```bash
nexus automations edit "daily monitor" --schedule "every 4h"
```

Always preserve the user's prompt verbatim unless they explicitly ask you to revise it.
