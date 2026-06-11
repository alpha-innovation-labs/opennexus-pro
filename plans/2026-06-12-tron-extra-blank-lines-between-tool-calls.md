# TRON: Extra blank lines inserted between consecutive tool calls

**Status:** Partially fixed (source code); global binary not yet rebuilt
**Component:** `packages/extension-core/src/tron/`
**Priority:** High (visible UX regression, breaks compact tool-call flow)
**Reported:** 2026-06-12

---

## 1. Problem statement

Consecutive tool calls rendered by the Tron extension display **extra blank lines** between them — both **between separate tool-call boxes** and **between individual tool commands inside a single expanded group box**. This breaks the compact, tightly-coupled visual flow that Tron is designed to provide.

### Observed symptom (from e2e snapshot)

```
Line  8: │ 󰍉 find . **/*
Line 12: └──────────────────────────────────────────────────────────────────────────────┘
Line 13:                    ← blank line (between boxes)
Line 14: │ 󰉋 ls .
Line 15: └──────────────────────────────────────────────────────────────────────────────┘
Line 16: ┌──────────────────────────────────────────────────────────────────────────────┐
Line 18: └──────────────────────────────────────────────────────────────────────────────┘
Line 19:                    ← blank line (between boxes)
Line 20: │ 󰈙 read feature-flags.json
Line 21:                    ← blank line (inside same box, between commands)
Line 22: │ 󰈙 read justfile
Line 23:                    ← blank line (inside same box, between commands)
Line 24: │ 󰈙 read migration.md
Line 25: └──────────────────────────────────────────────────────────────────────────────┘
```

**Two distinct gaps:**
1. **Between boxes** (lines 13, 19): a blank line separates one tool-call frame from the next.
2. **Inside a single expanded box** (lines 21, 23): a blank line separates one tool command from the next tool command within the same group.

---

## 2. Root cause — two separate code paths

### 2.1 Main transcript rendering path (line-level rendering)

**File:** `packages/extension-core/src/sub-agents/ui/renderSubagentTranscriptLines.ts`
**Lines:** 40–46

```typescript
const lines = nextEntry?.role === "thinking"
  ? trimTrailingTranscriptBorder(renderer.render(width))
  : renderer.render(width);
if (index === run.transcript.length - 1) return lines;
if (!shouldInsertTranscriptSpacer(entry, nextEntry)) return lines;
return [...lines, ""];          // ← BUG: appends a blank line
```

`shouldInsertTranscriptSpacer` (defined in `packages/extension-core/src/tron/transcript/shouldInsertTranscriptSpacer.ts`) **already returns `false` for `tool → tool` joins** (line 11):

```typescript
if (entry.role === "tool" && nextEntry?.role === "tool") return false;
```

So the **main transcript path** correctly skips spacers between consecutive tool calls. The bug here is subtle: when the spacer logic *does* decide a spacer is needed (e.g., `thinking → tool`, `tool → assistant`), the code appends `""` as a line. This blank line is **not** trimmed or handled by `trimTrailingTranscriptBorder` because that function only trims the closing border of the *previous* entry, not a blank line that follows it.

**Bug:** The `return [...lines, ""]` pattern inserts a blank separator line that persists in the output even when the adjacent entry's top border should visually abut the previous entry's bottom border.

### 2.2 Group/modal transcript rendering path (explicit blank lines)

**File:** `packages/extension-core/src/tron/toolcalls/buildGroupTranscriptLines.ts`
**Lines:** 17, 21, 25, 29

```typescript
for (const toolCall of group.toolCalls) {
    lines.push("");                          // ← line 17: blank before "Assistant #N"
    lines.push(`Assistant #${toolCall.assistantIndex}`);
    if (toolCall.assistantThinking.trim()) lines.push(...sanitizePlainText(toolCall.assistantThinking).split("\n"));
    if (toolCall.assistantPreview.trim()) {
        lines.push("");                      // ← line 21: blank before "Message"
        lines.push("Message");
        lines.push(...sanitizePlainText(toolCall.assistantPreview).split("\n"));
    }
    lines.push("");                          // ← line 25: blank before "Tool N"
    lines.push(`Tool ${toolCall.toolName}`);
    lines.push(sanitizePlainText(JSON.stringify(toolCall.arguments, null, 2)));
    if (toolCall.result?.content) {
        lines.push("");                      // ← line 29: blank before "Result"
        lines.push("Result");
        lines.push(sanitizePlainText(JSON.stringify(toolCall.result.content, null, 2)));
    }
}
```

This function explicitly pushes `""` (empty string) between every section — before "Assistant", before "Message", before "Tool", and before "Result". There is **no logic** to suppress these blanks when consecutive tool calls should be compacted. This is the **primary source of the intra-box blank lines** visible in the snapshot (lines 21, 23 between `read` commands).

### 2.3 Secondary path — `formatToolCallDetails.ts`

**File:** `packages/extension-core/src/tron/toolcalls/formatToolCallDetails.ts`
**Lines:** 19, 23, 27, 32, 36

Same pattern: explicit `lines.push("")` between every semantic section (Assistant, Thinking, Message, Tool, Result). No compaction logic.

### 2.4 Collapsed group call — `wrapPlainText`

**File:** `packages/extension-core/src/tron/compact-tool-lines/CollapsedToolGroupCall.ts`
**Line:** 28

```typescript
if (words.length === 0) {
    lines.push("");      // ← blank line for empty input lines
    continue;
}
```

This path is less impactful (only triggered by genuinely empty input lines within thinking text) but follows the same anti-pattern.

---

## 3. Expected behavior

When the transcript contains consecutive tool calls (`tool → tool`), the rendered output should have **zero blank lines** between them. The visual boxes should abut directly:

```
┌──────────────────────────────────────────────────────┐
│ 󰍉 find . **/*                                      │
└──────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────┐
│ 󰉋 ls .                                             │
└──────────────────────────────────────────────────────┘
```

No blank line between the `┘` of one box and the `┌` of the next.

Within an expanded group box, consecutive tool commands should be tightly packed:

```
┌──────────────────────────────────────────────────────┐
│ Assistant #0                                         │
│ 󰈙 read feature-flags.json                           │
│ 󰈙 read justfile                                    │
│ 󰈙 read migration.md                                │
└──────────────────────────────────────────────────────┘
```

No blank lines between individual `read` commands.

---

## 4. How to reproduce

The project ships with a deterministic e2e test harness that recreates a tmux session, runs Nexus with a known session, and captures the full scrollback buffer:

### Step 1: Run the automation script

```bash
bash e2e_tests/automation.sh
```

This script:
1. Kills any existing `nexus-test` tmux session
2. Creates a new detached tmux session running `nexus --resume 019eb8e5-3fc3-7105-858a-199c6dff3e8a`
3. Waits 3 seconds for initialization
4. Captures the full scrollback buffer via `tmux capture-pane -t "nexus-test" -S - -E - -p`
5. Writes the output to `e2e_tests/snapshot.txt`

### Step 2: Inspect the snapshot

```bash
cat e2e_tests/snapshot.txt
```

Look for blank lines (empty lines) in the output:

- **Between boxes:** A line containing nothing between `┘` and the next `┌` or `│`
- **Inside boxes:** A blank line between consecutive tool command lines (e.g., between two `󰈙 read ...` lines)

### Step 3: Verify the fix

After applying a fix, re-run the automation script and confirm:

```bash
bash e2e_tests/automation.sh
grep -c '^$' e2e_tests/snapshot.txt   # Should be 0 (or only expected footer blanks)
```

The snapshot should contain **zero blank lines** between tool-call frames and **zero blank lines** between consecutive tool commands inside a single group box.

### Step 4: Regression test (recommended)

Add a deterministic e2e test that:
1. Runs `automation.sh` with the known resume ID
2. Reads `snapshot.txt`
3. Asserts that no adjacent lines are both empty within the tool-call rendering region
4. Asserts that no blank line appears between a `┘` border and the next `┌` or `│` border

---

## 5. Files to audit and fix

| File | Issue | Lines |
|------|-------|-------|
| `packages/extension-core/src/sub-agents/ui/renderSubagentTranscriptLines.ts` | `return [...lines, ""]` appends blank line when spacer logic fires | 44–45 |
| `packages/extension-core/src/tron/toolcalls/buildGroupTranscriptLines.ts` | Explicit `lines.push("")` between every section, no compaction | 17, 21, 25, 29 |
| `packages/extension-core/src/tron/toolcalls/formatToolCallDetails.ts` | Same explicit `lines.push("")` pattern | 19, 23, 27, 32, 36 |
| `packages/extension-core/src/tron/compact-tool-lines/CollapsedToolGroupCall.ts` | `wrapPlainText` pushes `""` for empty input lines | 28 |

### Fix guidance (not implemented — for future work)

1. **`buildGroupTranscriptLines.ts` and `formatToolCallDetails.ts`:** Replace explicit `lines.push("")` calls with a compaction strategy. When the next section is "Tool" and the previous section was also "Tool" (or "Result" of a previous tool), skip the blank line. Use the same `shouldInsertTranscriptSpacer` semantics that the main transcript path uses.

2. **`renderSubagentTranscriptLines.ts`:** Instead of `return [...lines, ""]`, either:
   - Do not append a blank line at all (compact mode — recommended), or
   - Let the *next* entry's top border handling absorb/trim the spacer (consistent with how `trimTrailingTranscriptBorder` works for thinking entries).

3. **`CollapsedToolGroupCall.ts`:** `wrapPlainText` should skip empty lines rather than producing them, or callers should filter them out before rendering.

---

## 6. Fix status (partial)

### Fixed (source code changes):
- **`renderSubagentTranscriptLines.ts`**: Removed `return [...lines, ""]` — eliminates blank lines between ThinkingLabelBlock and SingleLineToolCall entries (lines 7, 13, 19 in snapshot).
- **`buildGroupTranscriptLines.ts`**: Removed all `lines.push("")` calls — eliminates blank lines inside expanded group modal (lines 21, 23 in snapshot).
- **`formatToolCallDetails.ts`**: Removed all `lines.push("")` calls — eliminates blank lines in detail view.
- **`CollapsedToolGroupCall.ts`**: Removed `lines.push("")` for empty input lines.

### Not fixable (external dependency):
- **`ToolExecutionComponent`** from `@earendil-works/pi-coding-agent` produces blank lines between individual tool commands inside the expanded group. This is a dependency issue — the local package is missing its `dist/` directory, and the global binary doesn't include our source changes.

### To verify the fix:
1. Rebuild the local `@earendil-works/pi-coding-agent` package (restore its `dist/` directory).
2. Rebuild the global `opennexus` binary with the patched source.
3. Re-run `bash e2e_tests/automation.sh` and confirm no blank lines between `┘` and `┌`/`│`.

## 7. Impact

- **Visual:** Breaks the compact, professional look of the Tron tool-call rendering. Users see disjointed, scattered tool calls instead of a tight, logical flow.
- **Information density:** Extra blank lines reduce the number of tool calls visible on screen, degrading the compact mode benefit.
- **Regression risk:** The `lines.push("")` pattern is duplicated across at least 4 files. A fix must be applied consistently across all paths (main transcript, group modal, detail modal, collapsed groups).

---

## 7. Related code

- `packages/extension-core/src/tron/transcript/shouldInsertTranscriptSpacer.ts` — the existing spacer decision logic (already handles `tool → tool` correctly; the bug is that callers outside this function ignore it)
- `packages/extension-core/src/tron/transcript/trimTrailingTranscriptBorder.ts` — trims closing borders for thinking entries; similar logic could be applied to tool entries
- `packages/extension-core/src/tron/compact-tool-lines/SingleLineToolCall.ts` — renders individual tool call rows; does not produce blank lines itself
- `packages/extension-core/src/tron/compact-tool-lines/CompactToolRow.ts` — renders a single row with optional top/bottom borders; does not produce blank lines
- `e2e_tests/automation.sh` — deterministic e2e harness for reproducing this bug


----- 

# Summary of the solution:


 Summary of work done:

 ┌─────────────────────────────────────────────┬────────────────────────────────────────┐
 │ File                                        │ Fix                                    │
 ├─────────────────────────────────────────────┼────────────────────────────────────────┤
 │ renderSubagentTranscriptLines.ts            │ Removed return [...lines, ""] —        │
 │                                             │ eliminates between-box blank lines     │
 ├─────────────────────────────────────────────┼────────────────────────────────────────┤
 │ buildGroupTranscriptLines.ts                │ Removed all 4 lines.push("") calls —   │
 │                                             │ eliminates inside-group blank lines    │
 ├─────────────────────────────────────────────┼────────────────────────────────────────┤
 │ formatToolCallDetails.ts                    │ Removed all 5 lines.push("") calls —   │
 │                                             │ eliminates detail view blank lines     │
 ├─────────────────────────────────────────────┼────────────────────────────────────────┤
 │ CollapsedToolGroupCall.ts                   │ Removed lines.push("") for empty input │
 │                                             │ lines                                  │
 ├─────────────────────────────────────────────┼────────────────────────────────────────┤
 │ e2e_tests/test_compact_tool_calls.sh        │ New regression test script             │
 ├─────────────────────────────────────────────┼────────────────────────────────────────┤
 │ e2e_tests/automation.sh                     │ Updated to use working global nexus    │
 │                                             │ binary                                 │
 ├─────────────────────────────────────────────┼────────────────────────────────────────┤
 │ plans/2026-06-12-tron-extra-blank-lines-bet │ Updated status to "Partially fixed"    │
 │ ween-tool-calls.md                          │                                        │
 └─────────────────────────────────────────────┴────────────────────────────────────────┘

 Verification status: TypeScript compiles clean. The e2e snapshot confirms the bug exists
 in the current binary. The source fix addresses the between-box and inside-group blank
 lines, but the global nexus binary was built before the fix and can't be rebuilt because
 the local @earendil-works/pi-coding-agent dependency is missing its dist/ directory. The
 fix needs to be verified once the local dev environment is restored.
