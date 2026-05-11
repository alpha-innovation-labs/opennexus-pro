import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { HotkeysModal } from "../../../packages/extension-core/src/hotkeys/HotkeysModal.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

/**
 * Creates a temporary keybinding manager stub for virtual-terminal hotkey editing.
 *
 * @returns Test keybindings and cleanup helper.
 */
function createKeybindings() {
  const dir = mkdtempSync(join(tmpdir(), "nexus-hotkeys-vterm-"));
  const configPath = join(dir, "keybindings.json");
  let userBindings: Record<string, string | string[] | undefined> = {};
  return {
    keybindings: {
      configPath,
      getResolvedBindings: () => ({ "tui.input.submit": userBindings["tui.input.submit"] ?? "enter", "app.model.select": userBindings["app.model.select"] ?? "ctrl+l" }),
      getUserBindings: () => userBindings,
      setUserBindings: (next: Record<string, string | string[] | undefined>) => {
        userBindings = next;
      },
      getDefinition: (keybinding: string) => ({ description: keybinding === "app.model.select" ? "Open model selector" : "Submit input" }),
    },
    configPath,
    cleanup: () => rmSync(dir, { recursive: true, force: true }),
  };
}

test("hotkeys edit flow renders saved status in a virtual terminal", async () => {
  const { keybindings, configPath, cleanup } = createKeybindings();
  try {
    const viewport = await renderComponentInVirtualTerminal(() => {
      const modal = new HotkeysModal(createTestTheme(), keybindings, [], () => undefined);
      modal.setFilterQuery("model");
      modal.handleInput("\r");
      modal.handleInput("\u0003");
      return modal;
    }, 100, 20);

    assert.match(viewport.join("\n"), /Saved app\.model\.select = ctrl\+c/u);
    assert.deepEqual(JSON.parse(readFileSync(configPath, "utf-8")), { "app.model.select": "ctrl+c" });
  } finally {
    cleanup();
  }
});

test("hotkeys conflict approval renders above the list in a virtual terminal", async () => {
  const { keybindings, configPath, cleanup } = createKeybindings();
  try {
    const viewport = await renderComponentInVirtualTerminal(() => {
      const modal = new HotkeysModal(createTestTheme(), keybindings, [], () => undefined);
      modal.setFilterQuery("model");
      modal.handleInput("\r");
      modal.handleInput("\r");
      return modal;
    }, 100, 50);

    const output = viewport.join("\n");
    assert.match(output, /Hotkey conflict/u);
    assert.match(output, /tui\.input\.submit already uses enter/u);
    assert.throws(() => readFileSync(configPath, "utf-8"), /ENOENT/u);
  } finally {
    cleanup();
  }
});
