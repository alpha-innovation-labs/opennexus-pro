import assert from "node:assert/strict";
import test from "node:test";
import { SlashMenuModal } from "../../../src/extensions/neo-editor/features/menu/SlashMenuModal.js";
import { getSettingsRootLeaf } from "../../../src/extensions/neo-editor/features/menu/getSettingsRootLeaf.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

/**
 * Creates the minimum extension context needed for slash-menu rendering tests.
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

test("settings root points to the custom settings branch", () => {
  assert.deepEqual(getSettingsRootLeaf(), {
    kind: "command",
    label: "Settings",
    description: "Open Pi's built-in settings selector with the live runtime contract.",
    value: "settings",
  });
});

test("slash menu does not expose raw merged settings like defaultModel", async () => {
  const modal = new SlashMenuModal(createContext() as never, () => "medium", () => undefined, () => undefined, () => undefined, () => undefined);

  await modal.refresh();
  modal.handleInput("d");
  modal.handleInput("e");
  modal.handleInput("f");
  const viewport = await renderComponentInVirtualTerminal(() => modal, 120, 30);

  assert.doesNotMatch(viewport.join("\n"), /defaultModel/);
  assert.doesNotMatch(viewport.join("\n"), /defaultProvider/);
});

test("selecting settings opens the custom settings submenu instead of handing off to /settings", async () => {
  let picked = "";
  const modal = new SlashMenuModal(createContext() as never, () => "medium", () => undefined, () => undefined, () => undefined, (commandText: string) => {
    picked = commandText;
  });

  await modal.refresh();
  modal.handleInput("\r");
  const viewport = await renderComponentInVirtualTerminal(() => modal, 120, 30);

  assert.equal(picked, "");
  assert.match(viewport.join("\n"), /Auto-compact/);
});
