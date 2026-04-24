---
title: Usage Rules
scorers:
  - "app-usage: Checks that app docs show a real invocation or run surface."
  - "leaf-usage: Checks that leaf docs show a concrete command or code usage example."
---

Must show how the item is meant to be used. There are 2 types:

1. App leaf meant to be called by a human.
   - Must show the real human-facing command surface.
   - Must document exactly one concrete command path.
   - Must not combine multiple sibling actionable commands in one leaf.
   - Must use the command help format for that one command.
   - The help block must include `Usage`, a short description paragraph, and `Options`.
   - Must use the actual command path, not only a dev recipe wrapper.
   - If the surface is only a command group that dispatches to other commands, document that group from the app or feature index, not as a leaf.

Example:
```text
❯ dokops infra hcloud server create --help
Usage: dokops infra hcloud server create [options] <role>

Create one Hetzner Cloud server.

Options:
  --name <name>              Server name to create.
  --server-type <type>       Hetzner server type to provision.
  --image <image>            Image to boot from.
  --location <location>      Hetzner location to provision in.
  --ssh-key <key>            SSH key name to attach.
  -h, --help                 Show help for this command.
```

2. Package or shared leaf meant to be used in code.
   - Must show code usage, not CLI usage.
   - A package leaf cannot be called directly by a human.
   - Shared leaves that are imported by other leaves must use code examples.

Example:
```python
from leaf import fn

fn(<params>)
```
