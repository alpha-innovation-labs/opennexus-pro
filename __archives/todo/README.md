# todo

<div align="center">
  <a href="https://github.com/juicesharp/nexus-tui-awesome/tree/main/packages/extensions-dev/src/todo">
    <picture>
      <img src="https://raw.githubusercontent.com/juicesharp/nexus-tui-awesome/main/packages/extensions-dev/src/todo/docs/cover.png" alt="todo cover" width="50%">
    </picture>
  </a>
</div>

[![npm version](https://img.shields.io/npm/v/@nexus/todo.svg)](https://www.npmjs.com/package/@nexus/todo)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Give the model a todo list it can keep across long sessions. `todo` adds the `todo` tool, the `/todos` slash command, and a live overlay above the editor to [Nexus](https://github.com/badlogic/pi-mono) - tasks survive `/reload` and conversation compaction, so the model picks up where it left off.

![Todo overlay widget above the Nexus editor](https://raw.githubusercontent.com/juicesharp/nexus-tui-awesome/main/packages/extensions-dev/src/todo/docs/overlay.jpg)

## Features

- **Live overlay above the editor** - see the model's plan at all times; completed items stay visible until the next agent response starts, then fall away; auto-hides when empty.
- **Survives `/reload` and compaction** - tasks replay from the conversation branch, not disk.
- **Status states** - pending, in_progress, completed, plus a deleted tombstone for audit.
- **Dependency tracking** - `blockedBy` with cycle detection, so the model can sequence work.
- **Smart truncation** - 12-line collapse threshold; completed tasks drop first, pending tasks stay visible last.

## Install

```bash
bundled with Nexus
```

Then restart your Pi session.

### Optional: localization

`todo` works standalone - install only this package and you get the full English UI. Install `@juicesharp/rpiv-i18n` alongside it to flip the overlay heading, `/todos` section headers, and status words to your active locale:

```bash
npm install @juicesharp/rpiv-i18n
```

With the SDK present, locale resolves from `--locale <code>` → `~/.config/i18n/locale.json` → `LANG` / `LC_ALL` → English. The `/languages` interactive picker and `nexus --locale <code>` startup flag are also enabled. Without the SDK, the extension stays online and renders English at every call site - no warning, no crash. Nexus bundles this extension and uses the shared optional i18n SDK when present.

## Tool

- **`todo`** - create / create_many / update / list / get / delete /
  delete_many / clear tasks. 4-state machine (pending → in_progress →
  completed, plus deleted tombstone).
  Supports `blockedBy` dependency tracking with cycle detection. Tasks persist
  via branch replay - survive session compact and `/reload`.

### Schema

```ts
todo({
  action: "create" | "create_many" | "update" | "list" | "get" | "delete" | "delete_many" | "clear",

  // create-only
  subject?: string,                // required for create
  blockedBy?: number[],            // initial dependency ids

  // create + update
  description?: string,
  activeForm?: string,             // present-continuous label shown while in_progress
  owner?: string,
  metadata?: Record<string, unknown>, // pass null per key to delete that key on update

  // create_many-only
  items?: Array<{
    subject: string,
    description?: string,
    activeForm?: string,
    blockedBy?: number[],
    owner?: string,
    metadata?: Record<string, unknown>,
  }>,

  // update-only
  addBlockedBy?: number[],         // additive merge into blockedBy
  removeBlockedBy?: number[],      // additive removal from blockedBy

  // update / get / delete
  id?: number,                     // task id

  // delete_many-only
  ids?: number[],                  // task ids

  // update (target) or list (filter)
  status?: "pending" | "in_progress" | "completed" | "deleted",

  // list-only
  includeDeleted?: boolean,        // default false - hides tombstones
})
```

Valid status transitions: `pending ⇄ in_progress`, either → `completed`, any → `deleted` (terminal). `delete` keeps the task as a tombstone so historic `blockedBy` references still resolve.

Returns:

```ts
{
  content: [{ type: "text", text: string }], // human-readable summary of the op
  details: {                                 // full snapshot - replay reads this back
    action: TaskAction,
    params: Record<string, unknown>,
    tasks: Array<{
      id: number,
      subject: string,
      description?: string,
      activeForm?: string,
      status: "pending" | "in_progress" | "completed" | "deleted",
      blockedBy?: number[],
      owner?: string,
      metadata?: Record<string, unknown>,
    }>,
    nextId: number,
    error?: string,                          // present only on validation/transition failures
  }
}
```

## Commands

- **`/todos`** - print the current todo list grouped by status.

## Overlay

The aboveEditor widget auto-renders whenever any overlay-visible tasks exist.
Completed tasks stay visible after completion until the next agent response
starts, then disappear from later overlay renders. 12-line collapse
threshold; completed tasks still drop first on overflow, pending tasks
truncate last. Auto-hides when the list is empty.

## Localization

`todo` localizes its TUI chrome (overlay heading, `/todos` section headers, status words) through `@juicesharp/rpiv-i18n` when the SDK is installed. Bundled locales: `de`, `en`, `es`, `fr`, `pt`, `pt-BR`, `ru`, `uk`. LLM-facing output (tool response envelope, reducer errors, schema descriptions) stays English by design.

The SDK is a soft optional peer - `todo` loads it via dynamic import at module init. If the SDK isn't installed, every render call site returns its inline English fallback and the extension stays online with English UI; no warning, no crash. See the Install section for adding the SDK after the fact. To contribute or override translations, see the `@juicesharp/rpiv-i18n` README "Contributing translations" section.

## License

MIT
