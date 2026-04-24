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

test("slash menu renders filtered command rows and previews in the virtual terminal", async () => {
  const modal = new SlashMenuModal(createContext() as never, () => "medium", () => undefined, () => undefined, () => undefined, () => undefined);

  modal.setQuery("for");
  await modal.refresh();
  const output = (await renderComponentInVirtualTerminal(() => modal, 120, 30)).join("\n");

  assert.match(output, /Menu/);
  assert.match(output, /Preview/);
  assert.match(output, /> \/for/);
  assert.match(output, /\/fork/);
  assert.doesNotMatch(output, /\/settings/);
});
