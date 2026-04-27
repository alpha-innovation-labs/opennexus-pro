import assert from "node:assert/strict";
import test from "node:test";
import { getHelpShortcutGroups } from "../../../src/extensions/neo-editor/features/help-shortcuts/getHelpShortcutGroups.js";
import { clearRegisteredShortcuts, recordRegisteredShortcut } from "../../../src/extensions/shared/shortcuts/index.js";

/**
 * Flattens help shortcuts for assertions.
 *
 * @returns Renderable shortcut labels.
 */
function getShortcutLabels(): string[] {
  return getHelpShortcutGroups().flatMap((group) => group.shortcuts.map((shortcut) => `${shortcut.label} ${shortcut.keys}`));
}

test.afterEach(() => {
  clearRegisteredShortcuts();
});

test("help groups include registered extension shortcuts", () => {
  recordRegisteredShortcut("ctrl+/", { description: "Open observations" });

  assert.deepEqual(getShortcutLabels().filter((label) => label.includes("Open observations")), ["Open observations Ctrl + /"]);
});

test("help groups omit shortcuts that were not registered", () => {
  assert.equal(getShortcutLabels().some((label) => label.includes("Ctrl + ;")), false);
});
