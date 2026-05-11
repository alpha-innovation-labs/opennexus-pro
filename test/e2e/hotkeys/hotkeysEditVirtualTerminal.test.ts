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
      getResolvedBindings: () => ({
        "tui.input.newline": userBindings["tui.input.newline"] ?? "shift+enter",
        "tui.input.submit": userBindings["tui.input.submit"] ?? "enter",
        "app.model.select": userBindings["app.model.select"] ?? "ctrl+l",
      }),
      getUserBindings: () => userBindings,
      setUserBindings: (next: Record<string, string | string[] | undefined>) => {
        userBindings = next;
      },
      getDefinition: (keybinding: string) => {
        if (keybinding === "app.model.select") return { description: "Open model selector" };
        if (keybinding === "tui.input.newline") return { description: "Insert newline" };
        return { description: "Submit input" };
      },
    },
    configPath,
    cleanup: () => rmSync(dir, { recursive: true, force: true }),
  };
}

/**
 * Creates a styled theme that emits long ANSI color sequences for virtual-terminal rendering.
 *
 * @returns Theme-like formatting helpers with terminal escape sequences.
 */
function createAnsiTestTheme(): any {
  return {
    fg(_color: string, value: string): string {
      return `\u001b[38;2;100;150;200m${value}\u001b[39m`;
    },
    bold(value: string): string {
      return `\u001b[1m${value}\u001b[22m`;
    },
    italic(value: string): string {
      return value;
    },
    strikethrough(value: string): string {
      return value;
    },
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

test("hotkeys highlighted row preserves the full label in a virtual terminal", async () => {
  const { keybindings, cleanup } = createKeybindings();
  try {
    const viewport = await renderComponentInVirtualTerminal(() => {
      const modal = new HotkeysModal(createAnsiTestTheme(), keybindings, [], () => undefined);
      modal.setFilterQuery("newline");
      return modal;
    }, 72, 40);

    const output = viewport.join("\n");
    assert.match(output, /▶ Insert newline\s+Shift \+ Enter/u);
    assert.doesNotMatch(output, /▶ I\s+Shift \+ Enter/u);
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
