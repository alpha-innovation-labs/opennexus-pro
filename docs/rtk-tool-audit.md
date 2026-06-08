# RTK Tooling Audit

## Overview

The RTK (Runtime Kit) extension wraps four built-in tools — `read`, `find`, `grep`, and `ls` — by routing them through the `rtk` CLI binary instead of the original Pi tools. This audit examines whether each RTK wrapper correctly forwards tool parameters (offset, limit, etc.) to the underlying CLI subcommand.

## RTK CLI flag support

| Subcommand | Limit flag | Offset flag |
|------------|-----------|-------------|
| `rtk read` | `-m <max-lines>` | No |
| `rtk grep` | `-m <max>` | No |
| `rtk find` | No flag | No |
| `rtk ls` | No flag | No |

## Tool-by-tool findings

### read — FIXED (commit `138f7c3`)

**Bug:** The RTK wrapper called `runtime.exec("read", ["-n", resolvedPath])` with no limit or offset arguments. The RTK CLI defaults to ~10 lines, so the user always received ~10 lines regardless of whether they omitted offset/limit. The JavaScript slicing code that follows only ran when the RTK call succeeded, but the data was already truncated.

**Fix:** The wrapper now:
- Forwards `-m <limit>` to `rtk read` when `input.limit` is explicitly provided.
- Skips JavaScript-level slicing entirely when neither offset nor limit is specified, letting the RTK CLI handle its own defaults (full file content).
- Falls back to JavaScript slicing when the user explicitly requests offset/limit, as a safety net when the RTK CLI returns fewer lines than expected.

### grep — No fix needed

The RTK wrapper already forwards `-m <effectiveLimit>` to `rtk grep`. The RTK CLI natively supports the `-m` flag. No JavaScript slicing is performed (the CLI handles truncation). No correctness or performance concerns.

### find — No correctness fix needed (performance concern only)

The RTK `find` subcommand has **no limit flag**. The wrapper never passes `input.limit` to the CLI. The JavaScript side performs `entries.slice(0, effectiveLimit)` which preserves **correctness** — the user sees the right number of results. However, RTK still scans and returns the entire file tree before the JS slice trims it, which is a **performance waste** when `limit=10`.

No RTK CLI flag exists to add. A future optimization would be to skip the RTK call entirely and use the original Pi `find` tool when a small limit is requested.

### ls — No correctness fix needed (performance concern only)

The RTK `ls` subcommand has **no limit flag**. The wrapper calls `runtime.exec("ls", [dirPath])` with no limit argument. The JavaScript side performs `entries.slice(0, effectiveLimit)` which preserves **correctness** but is a **performance concern** — RTK still lists all directory entries before JS slicing trims them.

No RTK CLI flag exists to add. A future optimization would be to skip the RTK call and use the original Pi `ls` tool when a small limit is requested.

## Summary table

| Tool | RTK supports limit? | CLI forwards limit? | JS slices? | Status |
|------|-------------------|---------------------|------------|--------|
| read | Yes (`-m`) | ✅ Fixed this commit | Yes (safety net) | **Correctness — fixed** |
| find | No flag | ❌ No | Yes | Performance only |
| grep | Yes (`-m`) | ✅ Already correct | N/A | None |
| ls | No flag | ❌ No | Yes | Performance only |

## Key decisions

- **Read** was the only correctness bug — the RTK CLI silently truncated results and the JS slice was applied to already-truncated data.
- **Find** and **ls** have no RTK CLI limit support, so there is no CLI fix to apply. JS slicing handles correctness; performance improvements would require avoiding the RTK path entirely for small limits.
- **Grep** was already correct — it forwards `-m` and the CLI handles truncation natively.
