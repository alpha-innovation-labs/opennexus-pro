# Execution Summary: RTK-Tron Tool Registration Decoupling

## Problem

Three layers of tool registration created redundant indirection:

1. **pi-coding-agent** registers 7 base tools (read, bash, edit, write, find, grep, ls)
2. **RTK** re-registers 5 of them (read, bash, find, grep, ls) with RTK-aware execute methods
3. **Tron** re-registers all 7 via `registerCompactBuiltInTool()`, overriding RTK with a delegation layer

Tron's delegation called `getBuiltInTools(getRtkExecutionCwd(ctx))[toolName].execute(...)` — a double-check on top of RTK's own delegation. Additionally, Tron evaluated `getBuiltInTools(process.cwd())[toolName]` at *registration time* (when `process.cwd()` may differ from the session's actual cwd) — a pre-existing bug.

## What Changed

### Deleted files (3 from tron):
- `packages/extension-core/tron/src/compact-tool-lines/registerCompactBuiltInTool.ts` — Tron's manual re-registration (contained the `process.cwd()` bug)
- `packages/extension-core/tron/src/compact-tool-lines/getBuiltInTools.ts` — only used by the deleted `registerCompactBuiltInTool`
- `packages/extension-core/tron/src/compact-tool-lines/createBuiltInTools.ts` — only used by the deleted `getBuiltInTools`

### Modified files (1):
- `packages/extension-core/tron/src/compact-tool-lines/registerCompactToolLinesExtension.ts` — removed the 7 `registerCompactBuiltInTool()` calls and its import. Tron now only handles `session_start`, `session_shutdown`, and activity grouping.

### No changes to RTK:
- RTK keeps its 5 `pi.registerTool()` calls. These override the base tools with RTK-aware implementations.

## Result

- **RTK is a pure execution layer** — registers its 5 tools, sets up runtime via `session_start`, rewrites bash via `tool_call`
- **Tron is a pure rendering layer** — its proxy (`createTronToolWrappingExtensionApi`) intercepts all `registerTool` calls and wraps them with compact rendering (`renderCall`/`renderResult`), preserving the `execute` method
- **`edit` and `write`** use core pi-coding-agent implementations directly (never handled by RTK, no longer wrapped by Tron)
- No more manual re-registration by Tron, no more double-check indirection, no more `process.cwd()` bug

## Key Insight

The proxy's `createCompactToolDefinition` does `{ ...definition, renderCall(...), renderResult(...) }` — it spreads the original definition, preserving `execute`. When RTK calls `pi.registerTool(createRtkXxxTool())`, the proxy intercepts it and adds rendering while the RTK-aware `execute` is preserved. This replaces "last registration wins" with "proxy wraps at registration."
