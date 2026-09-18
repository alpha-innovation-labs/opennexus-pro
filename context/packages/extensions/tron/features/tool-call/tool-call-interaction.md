# Tool-call interaction

In the fullscreen transcript, a completed left click on a tool-call box toggles that tool's result expansion. The call header, expanded output text, and borders toggle the per-tool expansion state. A click on the footer button toggles the body between the 30-row preview and the scrollable viewport. Scrollbar interactions retain priority over collapse clicks. A tool with no result does not toggle; partial results can expand while output streams.

## Mouse coordinates

The platform's `applyToolExecutionSpacingPatch` removes Pi's leading blank row so adjacent Tron frames meet. It records the removed row alongside the rendered dimensions and translates mouse events back into Pi's original row coordinates. This keeps the first border clickable and prevents clicks from spilling into adjacent tools or hidden rows.

Pi's existing tool mouse regions own the toggle, rather than a second Tron click handler. Child controls retain priority, press and drag events do not expand output, and keyboard focus stays with the editor. Streaming updates and resize retain each tool's expansion state; the global tool-expansion shortcut uses the same state through `setExpanded`.

## Expanded output viewport

In fullscreen mode, expanded tool output is capped at 30 terminal rows (`MAX_TOOL_OUTPUT_ROWS`). The cap applies uniformly to all tool outputs (write, read, bash) and to the body of the edit diff. A tool with no result does not toggle; partial results can expand while output streams.

The body follows an **ExpandableOutput** toggle model. Each tool's expansion state lives on a module-level `Map` keyed by `toolCallId`, so it survives renderer rebuilds across transcript passes:

- **Collapsed** (default): shows the first 30 rows as a static preview with NO scrollbar, plus a `▸ show more (N more)` footer button. The preview window preserves the current scroll offset, so collapsing ("show less") stays where the user was.
- **Expanded**: clicking the footer switches to a scrollable body. It renders 30 rows with a `█` vertical scrollbar (mouse wheel + thumb drag). A `▾ show less` footer button returns to the preview.
- When the body fits (≤30 rows): all rows are shown in full, no button, no scrollbar.

Short output uses its natural height and has no scrollbar or button. Overflow falls through to the surrounding transcript at a scroll boundary.

## Edit and write details

Expanded writes show raw content with per-token syntax highlighting, not the success receipt or the compact first-line preview. Tabs are expanded to four spaces; each content line becomes one terminal row so that the surrounding box borders and scroll viewport align correctly. An empty write displays an explicit `[empty file]` label.

The edit detail shows a unified diff via `DiffRenderer`. The renderer uses the `▌`/`│` column layout: left-aligned field width (6 minimum) carries a change marker (`▌` for added, blank/unmarked for context, or split-panel mode), while the content wraps to the remaining space. Context lines receive per-token syntax highlighting detected from the file path; added/removed lines retain solid green/red coloring. A pinned mode/stats bar sits above the body:

```
(edit · ~/path.ts ━━━━━━┓)
```

## Rendering

Expansion changes presentation only and never executes the tool again. Extension result renderers receive their own previous child as `lastComponent`, not Tron's surrounding border; built-in renderers receive no previous wrapper. This separation prevents expanding a result from invoking child-specific methods on a border component. Tools other than edit and write retain their existing result renderers; all tools retain their shared frame borders. Agent and workflow tools retain their live collapsed progress, with their existing detailed renderers used for expanded output. Failed tools retain the [[compact-tool-error|compact error presentation]].

A `DiffRenderer` goes through the generic `BorderedToolResult` path (side `│` borders + `└──┘` bottom) — it is **not** given an outer scroll state. It owns its own `ExpandableOutput` body internally. The mode bar is drawn above the viewport so it stays pinned regardless of scroll position.

### Syntax highlighting

Path-based syntax highlighting is provided by the shared `SyntaxHighlighter` class in `highlight.ts`. It resolves the language from the file path via pi's `getLanguageFromPath` map, caches results per line and per block, and falls back to a flat `toolOutput` color when the language is unknown or highlighting fails. Both the write tool and the edit diff renderer use a single instance bound to the target file path.

- **Write**: each content line is styled via `highlightBlock()`, returning one ANSI string per input line.
- **Edit context lines**: styled per-line via `highlightLine()` which returns `undefined` on miss, falling back to green/red solid coloring (standard diff convention). Added/removed lines are always solid green/red.

## Box frame and layout

The result body is wrapped in a bordered box: side `│` borders, a `├──┤` top border that separates the header from the body, and a `└──┘` bottom border. The top border occupies row 0; mouse coordinates offset by minus one so clicks inside the content region reach the right component.

A `DiffRenderer` renders through this same path but owns its own internal viewport — it does not receive an outer scroll state. Its structure:

```
┌─────────────┐   CompactToolRow / BorderedToolResult top border
│header       │
├─────────────┤   ─── Top separator (BorderedToolResult)
│mode/stats bar│   ← pinned (never scrolls)
│body preview  │   ← ExpandableOutput (30-row cap + toggle)
│or scrollable │
└─────────────┘
```

The edit mode bar shows: `↳ diff • +A • -R • H h • F f • mode [bar]`. The bar is a green/red ratio meter using the `━` character (U+2501 HEAVY HORIZONTAL LINE), ten cells wide — green cells proportional to added lines, red to removed. Summary mode (`width < 40` or total changes > 200) replaces the body with a single compact line.
