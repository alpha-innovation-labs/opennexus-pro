# Nested Group Label Rendering Fix

## Problem

The tools menu in the select list renders group headers correctly at the top level (Core, Nexus, Pi), but fails to render indented sub-group headers (Image, Subagents, Codegraph, etc.) when a tool has a nested group label like `"Nexus > Image"`.

### Root Cause

`getGroupLabel()` in `renderSelectListLines.ts` was returning only the top-level group (before `>`), so all Nexus tools shared `groupLabel = "Nexus"`. The renderer only emitted a header when `groupLabel !== previousGroupLabel`, so after the first Nexus tool, no more headers were emitted — even when the sub-group changed (Image → Subagents).

### Existing Code (Before Fix)

```typescript
function createSelectListRenderRows(options: RenderSelectListLinesOptions): SelectListRenderRow[] {
  const rows: SelectListRenderRow[] = [];
  let previousGroupLabel: string | undefined;
  let renderedGroupHeaderDescription = false;
  for (let index = 0; index < options.items.length; index += 1) {
    const item = options.items[index]!;
    const groupLabel = getGroupLabel(item);
    if (groupLabel && groupLabel !== previousGroupLabel) {
      rows.push({ text: renderGroupHeader(options, item, groupLabel, !renderedGroupHeaderDescription) });
      if (getGroupHeaderDescription(item)) renderedGroupHeaderDescription = true;
    }
    previousGroupLabel = groupLabel;
    rows.push(...renderSelectListItem(options, item, index === options.selectedIndex).map((text) => ({ itemIndex: index, text })));
  }
  return rows;
}
```

`renderGroupHeader` had sub-group rendering logic inside it, but it was only called once per top-level group (for the first item), so subsequent sub-group changes were never emitted.

## Solution

### 1. Track sub-group separately in `createSelectListRenderRows`

Added `previousSubGroupLabel` tracking. When the sub-group changes within the same top-level group, emit an indented sub-header line. When the top-level group changes, reset sub-group tracking.

### 2. New `renderSubGroupHeader` function

Renders the sub-group label with a 2-space indent prefix, using `accent` + `bold` theme styling:

```typescript
function renderSubGroupHeader(options: RenderSelectListLinesOptions, item: AutocompleteItem, subGroupLabel: string): string {
  const label = truncateToWidth(subGroupLabel, Math.max(1, options.width - 2), "");
  return `  ${options.theme.fg("accent", options.theme.bold(label))}`;
}
```

### 3. Removed sub-group rendering from `renderGroupHeader`

`renderGroupHeader` now only renders the top-level group label. All sub-group headers (including the first) are emitted by `renderSubGroupHeader`, avoiding duplicate/conflicting rendering.

## Expected Output

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│● Tools                                                                                     │
├────────────────────────────────────────────────────────────────────────────────────────────┤
│ Core                                                                                       │
│   ⚒ bash                   Execute bash commands (ls, grep, find, etc.)                    │
│   ⚒ edit                   Make precise file edits with exact text replacement, including  │
│   ⚒ find                   Find files by glob pattern (respects .gitignore)                │
│   ⚒ grep                   Search file contents for patterns (respects .gitignore)         │
│   ⚒ ls                     List directory contents                                         │
│   ⚒ read                   Read file contents                                              │
│   ⚒ write                  Create or overwrite files                                       │
│ Nexus                                                                                      │
│   Image                                                                                    │
│     ⚒ local_image_reader     Send a local image file and a query to an OpenAI-compatible mul│
│   Subagents                                                                                │
│     ⚒ subagent_prompt        Send a prompt to a subagent and wait for the response before re│
│     ⚒ subagent_read          Read terminal output from an agent via herdr agent read.        │
│     ⚒ subagent_send          Send text to an agent via herdr agent send-text, then send Ente│
│     ⚒ subagent_send_keys     Send key presses (e.g. Enter, Esc) to a subagent.               │
│     ⚒ subagent_start         Split the current pane right and start a mastracode subagent ag│
│   Webfetch                                                                                 │
│     ⚒ web_fetch              Fetch a URL and return text, markdown, html, or an image attach│
│   Websearch                                                                                │
│     ⚒ web_search             Search the web using a SearXNG instance and return up to 10 res│
│ Pi                                                                                         │
│   Codegraph                                                                                │
│     ⚒ codegraph_callees      Find all functions or methods that a specific symbol calls.     │
│     ⚒ codegraph_callers      Find all functions or methods that call a specific symbol.      │
│     ⚒ codegraph_explore      Return source for several related symbols grouped by file.      │
│     ⚒ codegraph_files        Get project file structure from the CodeGraph index.            │
│     ⚒ codegraph_impact       Analyze the impact radius of changing a symbol.                 │
│     ⚒ codegraph_node         Get one symbol's details plus callers and callees trail.        │
│     ⚒ codegraph_search       Quick symbol search by name. Returns locations only.            │
│     ⚒ codegraph_status       Get CodeGraph index status.                                     │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

Key visual differences from the broken output:
- Sub-group headers (Image, Subagents, Webfetch, Codegraph) render as **indented lines** under their parent group, not as part of the parent header text
- No more `Nexus - Image` or `Nexus - Subagents` — instead: `Nexus` (top-level) followed by `  Image` (indented sub-header)

## Files Modified

- `/Users/alpha/workspace/alpha-innovation-labs/__nexus/nexus-tui-awesome/packages/tui-kit/src/modal/select/renderSelectListLines.ts`

## Files Already Correct (No Changes)

- `/Users/alpha/workspace/alpha-innovation-labs/__nexus/nexus-tui-awesome/packages/extension-core/src/slash-menu/createToolLeaves.ts` — Already produces `groupLabel: "Nexus > Image"`, `"Nexus > Subagents"`, etc.

## Data Flow

1. `createToolLeaves.ts` produces `groupLabel: "Nexus > Image"` for tools
2. `getGroupLabel()` splits on ` > ` and returns `"Nexus"` (top-level)
3. `getSubGroupLabel()` splits on ` > ` and returns `"Image"` (sub-group)
4. `createSelectListRenderRows` tracks both `previousGroupLabel` and `previousSubGroupLabel`
5. When `subGroupLabel` changes (even within the same `groupLabel`), `renderSubGroupHeader` emits an indented sub-header line
