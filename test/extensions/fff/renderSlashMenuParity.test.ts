import assert from "node:assert/strict";
import test from "node:test";
import { SlashMenuModal } from "../../../src/extensions/shared/slash-menu/SlashMenuModal.js";
import { clearRegisteredSlashCommands } from "../../../src/extensions/shared/slash-menu/registerSlashCommand.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

/**
 * Creates the minimum slash-menu context needed for rendering tests.
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

test.beforeEach(() => {
  clearRegisteredSlashCommands();
});

test.after(() => {
  clearRegisteredSlashCommands();
});

test("slash menu renders built-in Pi commands including /fork in the virtual terminal", async () => {
  const modal = new SlashMenuModal(createContext() as never, () => "medium", () => undefined, () => undefined, () => undefined);

  await modal.refresh();
  const viewport = await renderComponentInVirtualTerminal(() => modal, 120, 30);

  assert.match(viewport.join("\n"), /\/fork/);
  assert.match(viewport.join("\n"), /\/settings/);
});
