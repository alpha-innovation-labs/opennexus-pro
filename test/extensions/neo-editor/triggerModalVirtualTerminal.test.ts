import assert from "node:assert/strict";
import test from "node:test";
import { AtModal } from "../../../src/extensions/neo-editor/promptline/AtModal.js";
import { SlashMenuModal } from "../../../src/extensions/shared/slash-menu/SlashMenuModal.js";
import { clearRegisteredSlashCommands } from "../../../src/extensions/shared/slash-menu/registerSlashCommand.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

/**
 * Creates the minimum extension context for slash-modal tests.
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

test("slash modal filters commands in the virtual terminal and closes on ctrl+c", async () => {
  let closed = false;
  const modal = new SlashMenuModal(createContext() as never, () => "medium", () => undefined, () => {
    closed = true;
  }, () => undefined, () => undefined);

  await modal.refresh();
  modal.handleInput("f");
  modal.handleInput("o");
  modal.handleInput("r");
  const filteredView = await renderComponentInVirtualTerminal(() => modal, 120, 30);
  modal.handleInput("\u0003");

  assert.match(filteredView.join("\n"), /\/fork/);
  assert.equal(closed, true);
});

test("at modal keeps navigation inside the picker in the virtual terminal", async () => {
  const modal = new AtModal(process.cwd(), createTestTheme() as never, () => undefined, () => undefined, () => undefined);
  modal.setQuery("src");
  modal.setItems([
    { value: "@alpha.ts", label: "@alpha.ts", description: "alpha" },
    { value: "@beta.ts", label: "@beta.ts", description: "beta" },
  ]);

  const firstView = await renderComponentInVirtualTerminal(() => modal, 120, 30);
  modal.handleInput("\u000e");
  const secondView = await renderComponentInVirtualTerminal(() => modal, 120, 30);

  assert.match(firstView.join("\n"), /@alpha\.ts/);
  assert.match(secondView.join("\n"), /@beta\.ts/);
});
