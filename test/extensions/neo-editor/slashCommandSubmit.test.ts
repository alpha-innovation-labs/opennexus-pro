import assert from "node:assert/strict";
import test from "node:test";
import { SessionManager } from "@mariozechner/pi-coding-agent";
import { createSlashModal } from "../../../src/extensions/neo-editor/promptline/trigger/createSlashModal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";

/**
 * Creates the minimum extension context required by the slash modal.
 *
 * @returns Fake extension context.
 */
function createContext() {
  return {
    cwd: process.cwd(),
    sessionManager: {
      getSessionDir() {
        return process.cwd();
      },
    },
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

test("slash modal enters the resume submenu without submitting the raw /resume command", async () => {
  const originalList = SessionManager.list;
  let submitted = "";
  let renders = 0;
  (SessionManager as unknown as { list: typeof SessionManager.list }).list = async () => [];

  try {
    const { modal } = createSlashModal(
      createContext() as never,
      () => undefined,
      () => {
        renders += 1;
      },
      () => undefined,
      () => "medium",
      () => undefined,
      (value) => {
        submitted = value;
      },
      (() => ({ hide: () => undefined, focus: () => void (renders += 1), isFocused: () => true })) as never,
    );

    modal.setQuery("resume");
    await modal.refresh();
    renders = 0;
    modal.handleInput("\r");
    await Promise.resolve();
    const viewport = await renderComponentInVirtualTerminal(() => modal, 120, 30);

    assert.equal(submitted, "");
    assert.match(viewport.join("\n"), /Resume/);
    assert.ok(renders > 0);
  } finally {
    (SessionManager as unknown as { list: typeof SessionManager.list }).list = originalList;
  }
});
