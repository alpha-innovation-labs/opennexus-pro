# Plan: Consolidate the conversation renderer — `renderSubagentTranscriptLines` is the source of truth

## Background & investigation

### The two rendering code paths today

The same logical thing — one turn in a Nexus conversation (user message → thinking → tool calls → tool results → assistant text) — is rendered by **two completely different code paths** depending on where it's shown.

**Path A — `/resume` picker (and the related transcript surfaces)**

- File: `packages/extension-core/src/slash-menu/updateResumePreview.ts` (the right-pane renderer in the `/resume` modal)
- File: `packages/extension-core/src/slash-menu/resume-transcript/readResumeTranscriptLines.ts` (entry point)
- File: `packages/extension-core/src/sub-agents/ui/renderSubagentTranscriptLines.ts` (the actual line renderer)
- File: `packages/extension-core/src/slash-menu/resume-transcript/toSessionTranscriptEntries.ts` (session → entries)
- File: `packages/extension-core/src/slash-menu/resume-transcript/toAssistantTranscriptEntries.ts` (assistant msg → entries)
- Entry shape: `SubagentTranscriptEntry = { role: "user" | "assistant" | "tool" | "error" | "thinking" | "system", text, createdAt, toolCallId?, toolName?, args?, result? }`
- Output shape: `string[]` of pre-styled terminal lines
- Used by: `/resume` picker, `/agents` subagent history modal, md-editor mini-app line chat, future similar transcript surfaces

The renderer itself:

```ts
// renderSubagentTranscriptLines.ts
function renderTranscriptEntry(theme, width, entry, connectThinkingToTools, connectThinkingFromTool) {
  switch (entry.role) {
    case "user":      return renderCompactInputBubble(entry.text, width);
    case "thinking":  return new ThinkingLabelBlock(getThinkingPreview(entry.text), connectThinkingToTools, connectThinkingFromTool).render(width);
    case "tool":      return renderSummary(toolCallId, toolName, summarizeArgs(toolName, entry.args ?? {}), theme, false).render(width);
    case "error":     return [theme.fg("error", `Error: ${entry.text}`)];
    case "assistant":
    case "system":    return renderMarkdownTranscript(entry.text, width);
  }
}
```

Compact, truncated, single source of truth for the "transcript" look. The user has approved this look in `/resume`.

**Path B — live conversation (the TUI the user is talking to right now)**

- File: `node_modules/@earendil-works/pi-coding-agent/dist/modes/interactive/components/assistant-message.js` (`AssistantMessageComponent`, the third-party Pi class)
- File: `node_modules/@earendil-works/pi-coding-agent/dist/modes/interactive/components/tool-execution.js` (`ToolExecutionComponent`)
- File: `packages/pi-platform/src/assistantMessageHook.ts` — installs a prototype hook so Tron can intercept `AssistantMessageComponent.updateContent`
- File: `packages/extension-core/src/tron/thinking/installAssistantThinkingStyle.ts` — sets the hook to Tron's renderer
- File: `packages/extension-core/src/tron/compact-tool-lines/registerCompactBuiltInTool.ts` — provides `renderCall` / `renderResult` to Pi's `ToolExecutionComponent`
- File: `packages/extension-core/src/tron/compact-tool-lines/createCompactToolDefinition.ts` — same for third-party tool definitions
- File: `packages/pi-platform/src/applyToolExecutionSpacingPatch.ts` — prototype patch that removes Pi's default leading spacer per tool
- File: `packages/pi-platform/src/applyToolGroupCollapsePatch.ts` — prototype patch for group collapse behavior
- File: `packages/pi-platform/src/applyCompactModeImagePatch.ts` — prototype patch that hides result images in compact mode
- File: `packages/pi-platform/src/applyInlineImageOverlayPatch.ts` — prototype patch for the inline image overlay

Output shape: a live TUI component graph. The components are interactive (click-to-expand, image rendering, live updates during streaming, etc.). The conversation tree is built and maintained by Pi's `interactive-mode.js`.

### The visual evidence the user reported

The user opened the same saved session in two places:

- **`/resume` picker (Path A)** — shows the conversation as compact, truncated rows. Each tool call is one line (icon + label + truncated path with `…`), each thinking block is one line (truncated with `…`), and assistant text is rendered as compact markdown.
- **Live conversation after opening it (Path B)** — shows the same content full-width. Tools have no truncation, thinking has the full first paragraph, and the chrome around the blocks is different.

Same data, two different visual contracts. Maintenance burden, cognitive friction for the user, and the risk of the two views drifting further over time.

### Why the two paths exist

Path A is intentionally a **static, line-based renderer**. It reads a saved session from disk, produces a `string[]`, and the right pane of the `/resume` modal renders those lines. No interactivity, no streaming, no Pi component graph. The /resume modal already shares this renderer with `/agents` history and the md-editor mini-app line chat, so it has a clear role: "render any saved transcript as a read-only preview."

Path B is the **live TUI**. It is fundamentally component-based because it has to support:
- live streaming of assistant text and thinking,
- tool calls that appear before their results (and re-render when results arrive),
- click-to-expand tool results, copy-tool-result, image rendering (kitty/iterm), partial results, error states, edit diff stats, etc.

Pi's `AssistantMessageComponent` + `ToolExecutionComponent` exist to carry that state. Tron plugs into them via the prototype hook (`assistantMessageHook.ts`) and via `renderCall`/`renderResult` definitions. The Tron source fix from earlier today (`renderCall` now derives `hasAttachedResult` from `context.expanded` directly) is also in this path.

### The decision we want to make

The user wants the **transcript renderer (Path A) to be the single source of truth**, and wants the live conversation (Path B) to consume that same renderer. The goal is one rendering pipeline for the same conceptual data, regardless of whether it's being shown as a static preview or as a live turn.

This is a meaningful architectural change. Below is the investigation, the trade-offs, and a phased approach.

---

## The trade-off we have to resolve

Path A produces a `string[]` of lines. Path B needs a live TUI component graph with state, interactivity, and streaming. The two are not directly substitutable.

Three realistic ways to bridge the gap:

### Option 1 — Wrap the transcript lines in a `Text` / `Markdown` component for the live view

Make the live conversation render through a single `Text` (or `Markdown`) component whose contents are the `string[]` produced by `renderSubagentTranscriptLines`, regenerated on every state change.

- Pro: One renderer. Trivial to wire.
- Con: Loses all interactive features in the live view — no click-to-expand, no live streaming (the lines are re-rendered as a whole), no inline image rendering, no edit diff stats, no spinner. This is a UX regression.

### Option 2 — Keep Path B as interactive, but share the "transcript entry → visual contract" with Path A

Refactor so the **per-entry rendering logic** (thinking label, tool call row, user bubble, markdown text, error row) lives in one place. The live view wraps each entry in a TUI component that delegates its visual rendering to the shared helper. The static view (Path A) calls the same helper and returns a `string[]`. The interactive parts (click, streaming, images) live in a thin component layer that only wraps the shared helper.

- Pro: Single source of truth for the visual per-entry contract. Interactive features are preserved. Both paths produce the same look.
- Con: Requires a clean separation between "render this entry to lines" and "render this entry as a TUI component that can update over time." Some refactor across both call sites.

### Option 3 — Drop Path B entirely and rebuild the live conversation on top of Path A

Throw away `AssistantMessageComponent` / `ToolExecutionComponent` and render the entire live conversation as one big `Text` (or a sequence of `Text`s per message), driven by `renderSubagentTranscriptLines` operating on a transcript-style data model that we maintain alongside Pi's tree.

- Pro: Clean break, single source of truth.
- Con: Massive regression. No streaming (or we reimplement it). No image rendering. No interactive expand. No edit diff stats. We'd be rewriting the entire conversation UI, which is a multi-week project and explicitly not in scope for "fix the duplicate renderer."

**Recommendation: Option 2.** The user's intent is to remove the visual divergence, not to gut the live TUI. Option 2 is the smallest change that makes both paths share the same per-entry visual contract while keeping the interactive features that make the live TUI usable.

---

## What the plan is

### 1. Make the per-entry rendering the unit of reuse

Today, `renderSubagentTranscriptLines.ts` has a private `renderTranscriptEntry(...)` that switches on `entry.role` and returns a `string[]` of styled lines. The Tron source fix from earlier today already does the same job for the live view inside `renderCall` / `renderResult`. They overlap heavily but live in different code paths.

**Move** the per-entry rendering into a shared module: `packages/extension-core/src/tron/transcript/renderTranscriptEntry.ts` (or similar). It exposes one function that takes a normalized `TranscriptEntry` (a renamed version of `SubagentTranscriptEntry`, but generalized to also accept the live Pi content-block shape) and a `RenderContext` (theme, width, expanded state, has-result state, frame state) and returns:

- the visual `string[]` of lines, and
- a small bit of metadata (e.g., does this entry draw a top border? does it draw a bottom border? is it a closed block?) so the live view can use the same renderer to compute its `hasAttachedResult` decisions.

The static view (Path A) just calls this and concatenates with the same `shouldInsertTranscriptSpacer` / `trimTrailingTranscriptBorder` logic that's already in `renderSubagentTranscriptLines`.

The live view (Path B) uses the same function to compute what to draw, and its component layer only handles state and interactivity (expansion toggles, streaming updates, image rendering inside the result block, edit diff stats). The "what does this look like" question is answered in one place.

### 2. Make the live view's tool renderer use the shared per-entry logic

Right now `registerCompactBuiltInTool.ts` and `createCompactToolDefinition.ts` each define their own `renderCall` and `renderResult`. They use `renderSummary(...)` (which is fine and should stay — it draws the single-line compact tool call row), but they also each reimplement the `hasVisibleResult` write logic that is now redundant after the source fix from earlier today.

The change here is to:

- Have `renderCall` call the shared `renderTranscriptEntry` for the `tool` role instead of the inline `renderSummary` + `hasAttachedResult` dance.
- Have `renderResult` call the shared `renderTranscriptEntry` for the result rendering, including the bordered block, instead of the inline `BorderedToolResult` / `renderCompactResult` choice.
- The frame-state sync (`syncToolCallFrameState`) and bottom-border decision live in the shared module, used by both paths.

This way, when Path A renders a saved `tool` entry it produces the same lines as when Path B renders the live `tool` component.

### 3. Make the assistant message hook in the live view delegate to the shared renderer

`installAssistantThinkingStyle.ts` currently sets the assistant message hook to a hand-rolled function that walks `message.content` and decides what to render for `text`, `thinking`, and `toolCall` blocks. It calls `bridgeThinkingToToolCalls` and `syncToolCallFrameState` and produces the right children for the assistant message component.

This is where the second copy of the visual contract lives. Refactor it so that for each assistant content block, it asks the shared `renderTranscriptEntry` (with the live `RenderContext`) what to do, and assembles the assistant message component from those outputs. The thinking label, the tool call row, the result border — all the same code.

### 4. Tighten the live view so its UI no longer needs the prototype patches we have today

Once the shared renderer is in place, several of the prototype patches become unnecessary or can be simplified:

- `applyToolExecutionSpacingPatch` (removes Pi's default leading spacer) — can be replaced by the shared module always emitting one leading spacer.
- `applyToolGroupCollapsePatch` (Pi's group collapse behavior) — can be replaced by the shared module's frame-state logic, which is already what `syncToolCallFrameState` does for the static view.
- `applyCompactModeImagePatch` (hides result images in compact mode) — stays; this is a runtime feature flag, not a duplicate of the visual contract.

This is the "delete code" payoff. The prototype patches exist today to coerce Pi's component graph into the look we want. If the live view's components are thin wrappers over the shared renderer, the patches are no longer doing visual work — they can be removed, and the code we actually keep is smaller.

### 5. Verify with one round of visual + e2e tests

The acceptance test is: open the same saved session in `/resume` (Path A) and in the live conversation after opening it (Path B). Both must render the same lines, given the same width.

Add an e2e test that:

- Loads a saved session fixture.
- Calls `renderSubagentTranscriptLines` with a fixed width.
- Spins up a virtual terminal with the live conversation tree (using the same fixture, hydrated into assistant + tool execution components).
- Strips ANSI and asserts the two outputs are line-for-line identical.

This is the deterministic regression guard the project already requires (e2e-only, no shallow tests).

---

## What this plan is **not**

- It is not a rewrite of the live TUI. We keep `AssistantMessageComponent` and `ToolExecutionComponent` from Pi, we keep the interactive features, we keep the streaming, the image rendering, the edit diff stats, and the click-to-expand.
- It is not a removal of any user-facing feature. The interactive features stay; what changes is which code draws the lines.
- It is not a single-PR change. It's a phased refactor that can land incrementally without breaking the live view at any intermediate step.
- It is not a fix for the bug from earlier today. That bug is already fixed at the source. This plan is the natural follow-up: now that the timing bug is gone, remove the rest of the duplication.

---

## Phased approach

### Phase 0 — Confirm the duplication and freeze the contract

- Grep the codebase to enumerate every site that renders a tool call, a thinking block, an assistant text block, or a user message. The user has already done the visual comparison. Document the call sites in a single table inside this plan file.
- Decide the canonical `TranscriptEntry` shape and the canonical `RenderContext` shape. The source-of-truth module is the only place that imports the per-role entry shape.
- **Done when:** this plan is reviewed and the entry shape is committed.

### Phase 1 — Extract the per-entry renderer into a shared module

- Create `packages/extension-core/src/tron/transcript/renderTranscriptEntry.ts` exporting `renderTranscriptEntry(theme, width, entry, context) → { lines: string[]; meta: EntryMeta }`.
- The `meta` object carries the small bits the live view needs (e.g., `hasAttachedResult`, `drawsOwnBottomBorder`, `frameKey`).
- Move `shouldInsertTranscriptSpacer` and `trimTrailingTranscriptBorder` from `renderSubagentTranscriptLines.ts` into the same module so Path A and Path B both use the same join logic.
- `renderSubagentTranscriptLines.ts` becomes a thin loop over the shared module, plus the pre-pass that calls `syncToolCallFrameState`.
- **Done when:** `/resume` and `/agents` history and the md-editor line chat look identical to before, the e2e tests for the resume picker still pass, and a new e2e test asserts the line output is unchanged.

### Phase 2 — Have the live tool renderer delegate the per-entry visual to the shared module

- Update `registerCompactBuiltInTool.ts` and `createCompactToolDefinition.ts` so their `renderCall` and `renderResult` use the shared module's per-entry output. The `hasAttachedResult` decision for the live view now comes from the `meta` returned by the shared module, not from a `state.hasVisibleResult` write.
- Update `installAssistantThinkingStyle.ts` so the assistant message hook assembles each block via the shared module.
- Keep the prototype patches that are still needed for runtime behavior (image hiding, leading spacer if it can't be expressed via the renderer), but mark the ones that become redundant.
- **Done when:** the e2e tests for the live conversation (the `tron/...` e2e suite) still pass, the visual proof in wterm still shows correct tool rendering, and a new e2e test asserts the live view's per-entry lines match the `/resume` lines for a known fixture.

### Phase 3 — Remove the now-redundant prototype patches

- Delete `applyToolExecutionSpacingPatch.ts` and remove its call site. The shared module emits the spacer.
- Delete `applyToolGroupCollapsePatch.ts` and remove its call site. The shared module's frame-state logic covers it.
- Keep `applyCompactModeImagePatch.ts` (this is a feature flag, not a duplicate of the visual contract).
- Keep `applyInlineImageOverlayPatch.ts` (this is a runtime feature, not a duplicate of the visual contract).
- **Done when:** `git grep applyToolExecutionSpacingPatch` and `git grep applyToolGroupCollapsePatch` return zero matches outside the deletion commits, the live view still looks correct in wterm, and the e2e suite still passes.

### Phase 4 — Lock the contract with a shared e2e test

- New e2e test in `test/e2e/tron/transcript/`: take a saved session fixture, render it via Path A (`renderSubagentTranscriptLines`), render the same data via Path B (live TUI components), strip ANSI, assert line-for-line equality at a fixed width.
- This test becomes the regression guard. Any future change that re-introduces a visual divergence fails this test.
- **Done when:** the test is added, runs green, and the user has visually confirmed the two views match in wterm.

---

## Risks and open questions

- **Pi's `AssistantMessageComponent` API surface.** The shared renderer needs to produce something Pi's component can host. The current hook returns strings, but the live view also has to support click-to-expand and result toggling. We'll need to keep the "live state lives in Pi's component, visual is shared" split clean.
- **Streaming updates.** The live view re-renders as the model streams. The shared renderer must be cheap to call on every keystroke. Today `renderSubagentTranscriptLines` is only called on selection change in `/resume`, so it's not a hot path. We'll need to profile and possibly memoize.
- **Image rendering.** The inline-image overlay is a runtime feature, not a duplicate. It still has to plug in cleanly after the shared module decides "this is an image-bearing tool result."
- **Edit/write diff stats.** Tron's `renderEditChangeStats` lives in the compact-tool-lines folder. It needs to remain part of the shared per-entry output for the `edit` and `write` tool entries.
- **Width-dependent behavior.** Both paths already take a `width`. The shared module must handle the case where width changes (e.g., terminal resize), and the live view's TUI render cycle must re-invoke the renderer.

---

## Acceptance criteria

- The user can open a saved session in `/resume` and then open the same session in the live TUI and the two views are line-for-line identical at the same width.
- `git grep "hasVisibleResult"` returns zero matches in `packages/extension-core` (the only references are in the new shared module's `RenderContext` typing, if any).
- The prototype patches from the `apply*Patch.ts` family that were patching the visual contract are deleted. Only the runtime feature-flag patches remain.
- A new e2e test asserts Path A and Path B produce identical line output for a known fixture. The test is wired into `just test` and runs in CI.
- The user has visually confirmed the consolidated renderer in wterm, with both the `/resume` preview and the live conversation open side by side.
