import assert from "node:assert/strict";
import test from "node:test";
import { WhichKeyModal } from "../../../packages/extensions/src/neo-editor/features/which-key/WhichKeyModal.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

/**
 * Creates a minimal keybinding manager for fullscreen rendering.
 *
 * @returns Fake keybinding manager.
 */
function createKeybindings() {
  return {
    getResolvedBindings: () => ({ "tui.input.submit": "enter" }),
    getDefinition: () => ({ description: "Submit input" }),
  };
}

test("hotkeys modal renders as fullscreen width and height", async () => {
  const originalRows = process.stdout.rows;
  process.stdout.rows = 18;
  try {
    const modal = new WhichKeyModal(createTestTheme() as never, createKeybindings(), [], () => undefined);
    const view = await renderComponentInVirtualTerminal(() => modal, 100, 18);

    assert.equal(view.length, 18);
    assert.equal(view[0]?.startsWith("┌"), true);
    assert.equal(view[0]?.length, 100);
    assert.match(view.join("\n"), /j\/k scroll/u);
  } finally {
    process.stdout.rows = originalRows;
  }
});
