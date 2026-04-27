import assert from "node:assert/strict";
import test from "node:test";
import { visibleWidth } from "@mariozechner/pi-tui";
import { createPanelOverlayOptions } from "../../../packages/extensions/src/overlay/createPanelOverlayOptions.js";
import { createSessionInfoRows } from "../../../packages/extensions/src/neo-editor/features/menu/session-info/createSessionInfoRows.js";
import { SessionInfoModal } from "../../../packages/extensions/src/neo-editor/features/menu/session-info/SessionInfoModal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

/**
 * Creates a fake context for session-info row tests.
 *
 * @returns Fake extension context.
 */
function createContext() {
  return {
    cwd: "/workspace/project",
    model: "gpt-test",
    sessionManager: {
      getEntries() {
        return [
          { type: "message", message: { role: "user", content: "hello" } },
          { type: "message", message: { role: "assistant", content: [{ type: "thinking", thinking: "plan" }, { type: "text", text: "ok" }] } },
          { type: "message", message: { role: "toolResult", content: [{ type: "text", text: "done" }] } },
        ];
      },
      getSessionName() {
        return "Design review";
      },
      getSessionId() {
        return "session-123";
      },
      getSessionDir() {
        return "/sessions";
      },
      getSessionFile() {
        return "/sessions/session-123.jsonl";
      },
      getLeafId() {
        return "leaf-1";
      },
    },
  };
}

test("session info rows show Nexus-owned current session details", () => {
  const rows = createSessionInfoRows(createContext() as never);
  const rendered = rows.join("\n");

  assert.match(rendered, /Title: Design review/u);
  assert.match(rendered, /Session ID: session-123/u);
  assert.match(rendered, /Model: gpt-test/u);
  assert.match(rendered, /Working directory: \/workspace\/project/u);
  assert.match(rendered, /Entries: 3/u);
  assert.match(rendered, /User messages: 1/u);
  assert.match(rendered, /Assistant messages: 1/u);
  assert.match(rendered, /Tool results: 1/u);
  assert.match(rendered, /Thinking blocks: 1/u);
});

test("session info modal consumes a percentage inside a full-width overlay", () => {
  const modal = new SessionInfoModal(createTestTheme(), createSessionInfoRows(createContext() as never), () => undefined);
  const lines = modal.render(120);

  assert.deepEqual(createPanelOverlayOptions(72), { anchor: "center", width: "100%", minWidth: 72, maxHeight: "90%" });
  assert.ok(lines.length > 0);
  assert.equal(visibleWidth(lines[0] ?? ""), 114);
  assert.equal(lines[0]?.startsWith("      ┌"), true);
});
