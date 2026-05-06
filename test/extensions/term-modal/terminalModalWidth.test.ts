import assert from "node:assert/strict";
import test from "node:test";
import { visibleWidth } from "@mariozechner/pi-tui";
import { TerminalModal } from "../../../packages/mini-apps/src/term-modal/ui/TerminalModal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

/**
 * Creates a fake TUI with terminal dimensions.
 *
 * @returns Fake TUI.
 */
function createTui() {
  return { terminal: { rows: 24 } };
}

/**
 * Creates a fake terminal buffer.
 *
 * @returns Fake xterm buffer.
 */
function createXterm() {
  return {
    resize: () => undefined,
    lineCount: () => 1,
    getDisplayLines: () => ["ready"],
    input: () => undefined,
  };
}

/**
 * Creates a fake PTY manager.
 *
 * @returns Fake PTY manager.
 */
function createPty() {
  return {
    resize: () => undefined,
    isRunning: () => true,
    pid: () => 123,
    error: () => undefined,
    input: () => undefined,
    kill: () => undefined,
  };
}

test("terminal modal renders as a centered percentage inside a full-width overlay", () => {
  const modal = new TerminalModal(createTui() as never, createTestTheme(), "Terminal", createXterm() as never, createPty() as never, () => undefined);
  const lines = modal.render(120);

  assert.ok(lines[0]?.startsWith("            ┌"));
  assert.equal(visibleWidth(lines[0] ?? ""), 108);
});
