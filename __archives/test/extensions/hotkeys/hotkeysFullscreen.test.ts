import assert from "node:assert/strict";
import stripAnsi from "strip-ansi";
import test from "node:test";
import { HotkeysModal } from "../../../packages/extension-core/src/hotkeys/HotkeysModal.js";
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
    const modal = new HotkeysModal(createTestTheme() as never, createKeybindings(), [], () => undefined);
    const view = await renderComponentInVirtualTerminal(() => modal, 100, 18);

    assert.equal(view.length, 18);
    assert.equal(view[0]?.startsWith("┌"), true);
    assert.equal(view[0]?.length, 100);
    assert.match(view.join("\n"), /j\/k scroll/u);
  } finally {
    process.stdout.rows = originalRows;
  }
});

test("hotkeys modal footer wraps colored hotkeys without duplicate base scroll hints", async () => {
  const originalRows = process.stdout.rows;
  process.stdout.rows = 10;
  try {
    const modal = new HotkeysModal(createTestTheme() as never, createKeybindings(), [], () => undefined);
    const view = await renderComponentInVirtualTerminal(() => modal, 92, 10);
    const footer = stripAnsi(view.slice(-5).join("\n"));

    assert.equal((footer.match(/j\/k scroll/gu) ?? []).length, 1);
    assert.match(footer, /j\/k scroll 0\/\d+ · gg top · G bottom/u);
    assert.match(footer, /Ctrl\+D\/U half page/u);
  } finally {
    process.stdout.rows = originalRows;
  }
});
