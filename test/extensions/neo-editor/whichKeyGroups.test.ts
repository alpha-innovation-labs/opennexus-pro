import assert from "node:assert/strict";
import test from "node:test";
import { getWhichKeyGroups } from "../../../packages/extensions/src/neo-editor/features/which-key/getWhichKeyGroups.js";
import { clearRegisteredShortcuts, recordRegisteredShortcut } from "../../../packages/tui-kit/src/shortcuts/index.js";

/**
 * Creates a minimal keybinding manager for which-key tests.
 *
 * @returns Fake keybinding manager.
 */
function createKeybindings() {
  return {
    getResolvedBindings: () => ({
      "tui.input.submit": "enter",
      "app.model.select": "ctrl+l",
    }),
    getDefinition: (keybinding: string) => ({ description: keybinding === "app.model.select" ? "Open model selector" : "Submit input" }),
  };
}

/**
 * Flattens which-key shortcuts for assertions.
 *
 * @returns Renderable shortcut labels.
 */
function getShortcutLabels(): string[] {
  return getWhichKeyGroups(createKeybindings()).flatMap((group) => group.shortcuts.map((shortcut) => `${shortcut.label} ${shortcut.keys}`));
}

test.afterEach(() => {
  clearRegisteredShortcuts();
});

test("which-key groups include Pi keybindings, Nexus triggers, and registered extension shortcuts", () => {
  recordRegisteredShortcut("ctrl+/", { description: "Open observations" });

  assert.equal(getShortcutLabels().includes("Submit input Enter"), true);
  assert.equal(getShortcutLabels().includes("Open hotkeys ?"), true);
  assert.deepEqual(getShortcutLabels().filter((label) => label.includes("Open observations")), ["Open observations Ctrl + /"]);
});

test("which-key groups omit shortcuts that were not registered", () => {
  assert.equal(getShortcutLabels().some((label) => label.includes("Ctrl + ;")), false);
});
