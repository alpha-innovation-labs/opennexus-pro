# Post Mortem: RTK-Tron Decoupling

## 1. What was the problem

Three layers of tool registration created redundant indirection and a pre-existing bug:

- **pi-coding-agent** registers 7 base tools (read, bash, edit, write, find, grep, ls)
- **RTK** re-registers 5 of them (read, bash, find, grep, ls) with RTK-aware execute methods
- **Tron** re-registers all 7 via `registerCompactBuiltInTool()`, overriding RTK with a delegation layer

Tron's delegation called `getBuiltInTools(getRtkExecutionCwd(ctx))[toolName].execute(...)` — a double-check on top of RTK's own delegation. Additionally, Tron evaluated `getBuiltInTools(process.cwd())[toolName]` at *registration time* (when `process.cwd()` may differ from the session's actual cwd) — a pre-existing bug.

## 2. What is the solution attempted

Remove Tron's manual re-registration entirely. Let Tron's proxy (`createTronToolWrappingExtensionApi`) handle compact rendering for all `registerTool` calls. The proxy's `createCompactToolDefinition` spreads the original definition, preserving `execute` — so when RTK calls `pi.registerTool(createRtkXxxTool())`, the proxy intercepts it and adds rendering while the RTK-aware `execute` is preserved.

- **RTK remains the execution layer** — registers its 5 tools, sets up runtime via `session_start`, rewrites bash via `tool_call`
- **Tron becomes the rendering layer** — its proxy wraps all `registerTool` calls with `renderCall`/`renderResult`
- **`edit` and `write`** use core pi-coding-agent implementations directly (never handled by RTK, no longer wrapped by Tron)

This replaces "last registration wins" with "proxy wraps at registration."

## 3. Touched files

### Deleted (3):
- `packages/extension-core/tron/src/compact-tool-lines/registerCompactBuiltInTool.ts`
- `packages/extension-core/tron/src/compact-tool-lines/getBuiltInTools.ts`
- `packages/extension-core/tron/src/compact-tool-lines/createBuiltInTools.ts`

### Modified (1):
- `packages/extension-core/tron/src/compact-tool-lines/registerCompactToolLinesExtension.ts`

## 4. Commit

`a89f851`
