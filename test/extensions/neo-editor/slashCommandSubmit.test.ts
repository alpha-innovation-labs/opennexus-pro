import assert from "node:assert/strict";
import test from "node:test";
import { createSlashModal } from "../../../src/extensions/neo-editor/promptline/trigger/createSlashModal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

/**
 * Creates the minimum extension context required by the slash modal.
 *
 * @returns Fake extension context.
 */
function createContext() {
  return {
    cwd: process.cwd(),
    ui: {
      theme: createTestTheme(),
      notify: () => undefined,
    },
  };
}

test("slash modal opens the custom settings submenu on settings pick", async () => {
  let text = "unchanged";
  let submitted = "";
  const { modal } = createSlashModal(
    createContext() as never,
    () => undefined,
    () => undefined,
    (value) => {
      text = value;
    },
    () => "medium",
    () => undefined,
    (value) => {
      submitted = value;
    },
    (() => ({ hide: () => undefined, focus: () => undefined, isFocused: () => true })) as never,
  );

  modal.setQuery("settings");
  await modal.refresh();
  modal.handleInput("\r");

  assert.equal(text, "unchanged");
  assert.equal(submitted, "");
});
