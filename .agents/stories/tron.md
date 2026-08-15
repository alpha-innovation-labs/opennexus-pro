# Tron Extension

## Executive Summary

Tron is a Nexus message-area extension that re-renders the AI chat transcript with compact, grouped, and visually polished UI surfaces. It covers user messages, assistant thinking, tool calls, and skill invocations — replacing default rendering with Tron's own compact styles, collapse/expand behavior, and a browsable tool-calls modal.

Tron also injects a `shift+ctrl+c` shortcut to toggle collapsed tool-group summaries across the entire session, and provides a `toolcalls` slash command that opens a two-pane modal for browsing and inspecting every tool call on the current branch.

## Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  User types message ──────────────────────────────────────────►│
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  User Message (renderCompactInputBubble)                  │ │
│  │  • Bordered bubble with prefix "» "                      │ │
│  │  • Metadata: model, tokens, latency, tools used          │ │
│  │  • Cached by text + width + metadata key                 │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Assistant response (streaming)                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Thinking (ThinkingLabelBlock)                            │ │
│  │  • Compact folded label with "󰧑" icon                    │ │
│  │  • Connects to / from tool calls (shared border box)      │ │
│  │  • Expandable → full Markdown rendered                   │ │
│  └───────────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Tool Calls (renderSummary)                               │ │
│  │  • Compact single-line summary                            │ │
│  │  • Grouped by user turn (collapsed/expandable)            │
│  │  • Bridge: first tool attaches to thinking border         │ │
│  │  • Failed calls → red FailedToolCallResult                │ │
│  └───────────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Tool Results (CompactToolResult / BorderedToolResult)    │ │
│  │  • Expanded results render full bordered box              │ │
│  │  • Collapsed: hidden until expanded                       │ │
│  └───────────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Skill Invocations (renderSkillInvocationMessage)         │ │
│  │  • Custom styled rendering for skill calls                │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  User presses shift+ctrl+c  ──►  toggleToolGroupCollapse()     │
│  ──► invalidates all activity ──► rebuilds chat from messages  │
│                                                                 │
│  User types /toolcalls  ──►  ToolCallsModal                   │
│  ──► two-pane: left = grouped calls, right = detail render    │
└─────────────────────────────────────────────────────────────────┘
```

## Features

- **Compact user messages** — bordered bubble with `» ` prefix, metadata footer (model, tokens, latency, tools), and text/width/metadata-based render caching
- **Collapsible thinking** — folded `󰧑` icon label that expands to full Markdown rendering; supports bridging to tool calls with shared top/bottom borders
- **Compact tool call summaries** — single-line tool call rows grouped by user turn, with argument summarization, error highlighting, and icon lookup by tool name
- **Collapsed tool group toggle** — `shift+ctrl+c` shortcut collapses all tool groups to summaries across the entire session, with full re-expand support
- **Tool calls modal** (`/toolcalls`) — two-pane browse modal: left pane lists grouped calls and user messages; right pane shows full argument/result rendering for the selected call
- **Thinking-to-tool bridge** — first tool call in a group visually attaches to the preceding thinking block via shared border rendering; last tool can close the shared box
- **Failed tool call rendering** — red-bordered error display with extracted error text
- **Skill invocation styling** — custom rendering surface for skill calls
- **Render profiling** — optional profiling log tracks per-path render timing (slow >8ms), cache hit/miss rates, and aggregate statistics (every 100 calls)
- **Compact tool wrapping API** — `createTronToolWrappingExtensionApi` proxies `registerTool` so every registered tool automatically gets Tron's compact rendering
- **User message metadata store** — async metadata resolution (model, tokens, latency, tools used) with pending queue and per-component caching
- **Working prompt timer** — visual indicator for long-running assistant responses

## Dependencies

### Package Interaction Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│  @earendil-works/pi-coding-agent                                  │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  ExtensionAPI          pi.on() / pi.registerCommand()         │ │
│  │  ToolDefinition        registerTool() → Tron wraps            │ │
│  │  ToolExecutionComponent  patch.updateDisplay (hide images)    │ │
│  │  InteractiveMode       patch.setupKeyHandlers (collapse key)  │ │
│  │  sessionManager        getBranch() for timing bootstrap       │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                              ▲
                              │ imports types & patches prototypes
                              │
┌─────────────────────────────────────────────────────────────────────┐
│  @earendil-works/pi-tui                                           │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  Container           base class for ThinkingLabelBlock        │ │
│  │  Markdown            rendered assistant thinking text          │ │
│  │  truncateToWidth     thinking label truncation                 │ │
│  │  visibleWidth        text width calculation (user messages)    │ │
│  │  SelectPreviewModal  ToolCallsModal base class                 │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                              ▲
                              │ uses TUI primitives for rendering
                              │
┌─────────────────────────────────────────────────────────────────────┐
│  @nexus/tui-kit                                                   │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  SelectPreviewModal  ToolCallsModal extends this               │ │
│  │  withSlashMenuGroup    /toolcalls slash command grouping       │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                              ▲
                              │ modal base + slash menu helper
                              │
┌─────────────────────────────────────────────────────────────────────┐
│  @nexus/observability                                             │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  logExtensionEvent()  extension lifecycle logging              │ │
│  │  isStartupProfileEnabled()  profile-gated overflow logging     │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                              ▲
                              │ writes to startup debug log
                              │
┌─────────────────────────────────────────────────────────────────────┐
│  @nexus/pi-platform                                               │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  setAssistantMessageUpdateHook()  thinking update hook         │ │
│  │  KEYBINDINGS          app.tools.collapse key registration      │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                              ▲
                              │ keybindings + message hooks
                              │
┌─────────────────────────────────────────────────────────────────────┐
│  @earendil-works/pi-ai                                            │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  getMarkdownTheme()  markdown rendering theme for thinking   │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Interaction Areas

| Package | Interaction |
|---|---|
| `@earendil-works/pi-coding-agent` | Tron wraps `ExtensionAPI.registerTool` to inject compact rendering; patches `ToolExecutionComponent.updateDisplay` to hide images in collapse mode; patches `InteractiveMode.setupKeyHandlers` to inject `shift+ctrl+c` collapse shortcut; listens to session events (`session_start`, `message_start`, `message_end`, `agent_end`, `session_shutdown`) via `pi.on()` |
| `@earendil-works/pi-tui` | Uses `Container`, `Markdown`, `truncateToWidth`, `visibleWidth` for rendering thinking labels, user bubbles, and tool summaries; extends `SelectPreviewModal` for the tool-calls browse modal |
| `@nexus/tui-kit` | Extends `SelectPreviewModal` as the base class for `ToolCallsModal`; uses `withSlashMenuGroup` to register the `/toolcalls` slash command under the "Extensions" group |
| `@nexus/observability` | Calls `logExtensionEvent()` to emit lifecycle and overflow diagnostics to the startup debug log; uses `isStartupProfileEnabled()` to gate overflow warnings |
| `@nexus/pi-platform` | Calls `setAssistantMessageUpdateHook()` to register thinking update callbacks; patches `KEYBINDINGS` to register the `app.tools.collapse` shortcut definition |
| `@earendil-works/pi-ai` | Calls `getMarkdownTheme()` to obtain the markdown rendering theme for assistant thinking blocks |

## Story

Tron starts by patching two things on startup: it hijacks `ToolExecutionComponent.updateDisplay` to hide images when compact mode is active, and it wraps the `InteractiveMode.prototype.setupKeyHandlers` to inject a `shift+ctrl+c` handler that toggles tool-group collapse. When the user presses that shortcut, Tron calls `toggleToolGroupCollapse()` to flip a boolean, invalidates every rendered activity component by iterating over a `Map<string, ActivityInvalidator>`, clears the chat container, rebuilds it from the current messages, and updates the status bar with a "Tool groups: collapsed" or "expanded" message.

When the extension registers, it installs five sub-extensions in parallel. The user-message sub-extension restores the default renderer, installs a render hook that intercepts every user message component and routes it through `renderCachedUserMessage`, and registers lifecycle handlers that capture prompt metadata (model, tokens, latency, tools used) from `session_start`, `session_tree`, `session_compact`, and `message_start` events. When a user message renders, Tron resolves its metadata from a pending queue (consuming one entry per message via `pendingMetadata.shift()`), looks up the component's own cached metadata, and falls back to the queue. If metadata is available, it renders it on the bubble's bottom border. The rendered lines are cached per-component keyed by text, width, and metadata cache key, and on cache miss Tron emits a `user-message` cache event to the profiling system.

When the assistant starts streaming, Tron listens to `message_start` with role `assistant` and records `Date.now()` as the message start timestamp. If the message is a user message, it records the turn start instead. When the message ends, Tron computes the elapsed duration, formats it as a compact label (e.g. "2.3s"), and stores it keyed by the message timestamp. When the agent ends, it clears the active turn markers. On session start it bootstraps these timings from the current branch; on session shutdown it resets everything.

Tron also installs an assistant-message update hook via `setAssistantMessageUpdateHook`. Every time the assistant message component updates, the hook receives the component and the current `AssistantMessage`. It clears the component's content container, syncs the tool-call frame state from the message's content blocks (recording which tool calls are visible and their order), then iterates over each content block. For text blocks, it renders them as Markdown with the Tron tool-output color. For thinking blocks, it checks whether the next content block is a tool call — if so, it calls `bridgeThinkingToToolCalls` to mark the first tool as visually attached to the thinking block. If the thinking block is hidden (compact mode), it renders a compact `ThinkingLabelBlock` with the `󰧑` icon and truncated text; if expanded, it renders the full Markdown. The thinking block draws a top border (or connects to a previous tool's bottom border) and a bottom border (or connects to the next tool's top border) depending on whether `connectToTools` or `connectFromTool` is true. After rendering all content, if the message has no tool calls and a duration label, Tron appends a small metadata text showing the duration. If the message was aborted or errored, it appends an error text or a `BorderedAssistantErrorRow`.

When a tool is registered via the Tron-wrapped `ExtensionAPI`, Tron's `createCompactToolDefinition` wraps the original `ToolDefinition` to set `renderShell: "self"`, then replaces `renderCall` and `renderResult` to delegate to `renderTranscriptEntry`. Before rendering, each call registers itself with `rememberActivityInvalidator(toolCallId, invalidate)` so that later, when the collapse toggle fires, Tron can call `invalidateActivityKeys` to re-render every tool row. The `renderCall` path renders a compact summary via `renderSummary(toolCallId, toolName, summarizeArgs(toolName, args), theme, hasAttachedResult)`, which dispatches to tool-specific summarizers: `read` and `find` and `ls` show the path (shortened), `bash` shows the first line of the command, `edit` shows the file path plus a truncated preview of the old/new text with inline `+N -M` change stats, `write` shows the path plus a truncated first line of content with a `+N -0` stat, and `grep` shows the path, pattern, and flags. Unknown tools fall back to `summarizeGenericObjectArgs`.

When a tool result arrives, Tron's `renderResult` path checks if the result is an error — if so, it renders a `FailedToolCallResult` with red text. If the tool group is not expanded, it renders nothing (the result is hidden). If expanded and the original tool definition provides a `renderResult`, Tron wraps it in a `BorderedToolResult`; otherwise it renders a `CompactToolResult`.

Skill invocations are handled by `renderSkillInvocationMessage`, which extracts the skill name from the component's `skillBlock.name` and renders it as a `CompactToolRow` with the skill icon (`󰚄`), label "skill", the skill name as the main text, and "ctrl+o to expand" as the options text.

When the user types `/toolcalls`, Tron calls `getBranchToolCalls(ctx)` to collect all tool calls from the current branch, grouping them by user turn. Each group gets a user preview line (the user message text) and a duration label computed from the group's user and last assistant timestamps. If collapse mode is off, each tool call in the group is listed as a separate item with a summary label from `summarizeToolCall`. The two-pane `ToolCallsModal` (extending `SelectPreviewModal`) shows the grouped list on the left. When the user selects a tool call, the right pane renders its full argument and result via `renderBuiltInToolDetails`. The user can press `c` to toggle collapse, `j`/`k` to navigate, and `J`/`K` to jump between user message headers.

Tron also installs a working-prompt timer that starts when `agent_start` fires. It calls `createWorkingPromptTimer(ctx)` which sets up an interval (every 1000ms) that calls `ctx.ui.setWorkingMessage(formatWorkingPromptMessage(startedAt, now()))` to display an elapsed-time message in the status bar. When `agent_end` or `session_shutdown` fires, the timer stops and the working message is cleared.

Tron listens to these events across all sub-extensions: `session_start`, `message_start`, `message_end`, `agent_start`, `agent_end`, `session_tree`, `session_compact`, and `session_shutdown`. On session start it resets all activity grouping state (clearing `activityInvalidators`, `bridgedToolCallIds`, `bridgedToolCallClosingIds`, `toolCallTopBorderIds`, `toolCallBottomBorderIds`, `toolCallFrameSyncedIds`, `toolActivityFrameCursor`, and all collapsed summary state). On session shutdown it resets the same state.

During rendering, Tron optionally profiles every render path. `measureTronRender` wraps a render callback, records its duration and line count, and passes the data to `recordTronRenderTiming`. If a single render takes ≥8ms, it writes a `render:slow` event to the profiling log. Every 100 calls, it writes a `render:summary` event with count, total/avg/max ms, and avg lines. For cache events, `recordTronCacheEvent` tracks hit/miss counts per cache name and writes a `cache:summary` every 100 events with a computed hit rate. All profiling output is gated by `isTronProfilingEnabled()` and written to a file at `tronProfileLogPath`.
