# Tron Tool-Execution Spacing — How It Works

## Problem

Pi's `ToolExecutionComponent` (in `@earendil-works/pi-coding-agent`) injects an extra blank line between every consecutive tool call in the Tron compact transcript view. This breaks the tight visual flow Tron is designed to provide.

## Root Cause

Two separate code paths in the upstream `ToolExecutionComponent` inject blank lines:

### 1. Constructor — leading Spacer (already handled)

```js
// node_modules/@earendil-works/pi-coding-agent/dist/modes/interactive/components/tool-execution.js:42
this.addChild(new Spacer(1));
```

The constructor always adds a `Spacer(1)` as the first child. This was already patched by `applyToolExecutionSpacingPatch` which intercepts `addChild` and drops the first `Spacer` instance.

### 2. render() — leading blank line (THE BUG)

```js
// node_modules/@earendil-works/pi-coding-agent/dist/modes/interactive/components/tool-execution.js:187-189
if (contentLines.length > 0) {
    lines.push("");           // ← extra blank line before every self-rendering tool
    lines.push(...contentLines);
}
```

When a tool has `renderShell: "self"` (which is how Tron's compact tools work), the `render()` method **unconditionally** prepends `""` (an empty string = blank line) before the content lines. This is independent of the constructor's Spacer — it's baked into the `render()` return value.

**This is the bug that caused visible blank lines between consecutive tool calls.**

## The Fix

`applyToolExecutionSpacingPatch` in `packages/pi-platform/src/applyToolExecutionSpacingPatch.ts` now patches **two things** on `ToolExecutionComponent.prototype`:

1. **`addChild`** — drops the constructor's `new Spacer(1)` (existing behavior).
2. **`render`** — strips the leading `""` from the returned lines array when present (new behavior).

```ts
prototype.render = function renderWithoutLeadingBlankLine(width: number): string[] {
  const lines = originalRender.call(this, width);
  if (lines.length > 0 && lines[0] === "") {
    return lines.slice(1);
  }
  return lines;
};
```

## Why This Pattern Is Fragile

Pi's `ToolExecutionComponent` is an external dependency. Every time it changes its rendering behavior (adding spacers, changing `render()` output, modifying `renderShell` handling), the Tron compact tool view breaks silently. The patch is a **prototype-level monkey-patch** that assumes:

- The `render()` method exists and returns `string[]`
- The first element of the returned array is the blank line to strip
- No other part of the returned array is affected by stripping that element

If Pi changes the `render()` signature, the return type, or the blank-line behavior, the patch either stops working (regression) or silently strips the wrong content (corruption).

## Files Involved

| File | Role |
|------|------|
| `packages/pi-platform/src/applyToolExecutionSpacingPatch.ts` | Patches `ToolExecutionComponent.prototype.addChild` and `.render` |
| `packages/extension-core/src/tron/compact-tool-lines/registerCompactBuiltInTool.ts` | Registers compact tools with `skipLeadingSpacer: true` and `renderShell: "self"` |
| `packages/extension-core/src/tron/compact-tool-lines/SingleLineToolCall.ts` | Compact single-row tool call renderer |
| `packages/extension-core/src/tron/shared/compact-row/CompactToolRow.ts` | Shared compact row with optional borders |
| `packages/extension-core/src/tron/shared/compact-line/renderCompactLine.ts` | Renders one compact line (icon + label + main + options) |

## Upstream Source

`node_modules/@earendil-works/pi-coding-agent/dist/modes/interactive/components/tool-execution.js`

Lines 42 (constructor Spacer) and 187-189 (render blank line) are the two injection points.
