import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { HotkeysModal } from "../../../packages/extensions/src/hotkeys/HotkeysModal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

/**
 * Creates a temporary keybinding manager stub backed by keybindings.json.
 *
 * @returns Test keybindings and cleanup helper.
 */
function createKeybindings() {
  const dir = mkdtempSync(join(tmpdir(), "nexus-hotkeys-"));
  const configPath = join(dir, "keybindings.json");
  let userBindings: Record<string, string | string[] | undefined> = {};
  const defaults = {
    "tui.input.submit": "enter",
    "app.model.select": "ctrl+l",
  };
  return {
    keybindings: {
      configPath,
      getResolvedBindings: () => ({ ...defaults, ...userBindings }),
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

test("hotkeys modal lets enter edit the filtered keybinding and writes keybindings.json", () => {
  const { keybindings, configPath, cleanup } = createKeybindings();
  try {
    const modal = new HotkeysModal(createTestTheme(), keybindings, [], () => undefined);

    modal.handleInput("/");
    modal.handleInput("m");
    modal.handleInput("o");
    modal.handleInput("d");
    modal.handleInput("e");
    modal.handleInput("l");
    modal.handleInput("\r");
    modal.handleInput("b");

    assert.deepEqual(JSON.parse(readFileSync(configPath, "utf-8")), { "app.model.select": "b" });
    assert.deepEqual(keybindings.getUserBindings(), { "app.model.select": "b" });
  } finally {
    cleanup();
  }
});

test("hotkeys modal marks the focused item and moves focus with jk", () => {
  const { keybindings, cleanup } = createKeybindings();
  try {
    const modal = new HotkeysModal(createTestTheme(), keybindings, [], () => undefined);

    assert.match(modal.render(100).join("\n"), /▶ Submit input\s+Enter/u);

    modal.handleInput("j");
    assert.match(modal.render(100).join("\n"), /▶ Open model selector\s+Ctrl \+ L/u);

    modal.handleInput("k");
    assert.match(modal.render(100).join("\n"), /▶ Submit input\s+Enter/u);
  } finally {
    cleanup();
  }
});

test("hotkeys modal changes focused pane with h and l while focused pane stays left", () => {
  const { keybindings, cleanup } = createKeybindings();
  try {
    const modal = new HotkeysModal(createTestTheme(), keybindings, [], () => undefined);

    let output = modal.render(100).join("\n");
    assert.match(output, /┌[^\n]+Input[^\n]+┌[^\n]+Nexus Triggers[\s\S]*▶ Submit input\s+Enter/u);

    modal.handleInput("l");
    output = modal.render(100).join("\n");
    assert.match(output, /┌[^\n]+Nexus Triggers[^\n]+┌[^\n]+Input[\s\S]*▶ Open hotkeys\s+\?/u);

    modal.handleInput("h");
    output = modal.render(100).join("\n");
    assert.match(output, /┌[^\n]+Input[^\n]+┌[^\n]+Nexus Triggers[\s\S]*▶ Submit input\s+Enter/u);
  } finally {
    cleanup();
  }
});

test("hotkeys modal cancels editing with escape", () => {
  const { keybindings, configPath, cleanup } = createKeybindings();
  try {
    const modal = new HotkeysModal(createTestTheme(), keybindings, [], () => undefined);

    modal.setFilterQuery("model");
    modal.handleInput("\r");
    modal.handleInput("\u001b");

    assert.doesNotMatch(modal.render(100).join("\n"), /Editing app\.model\.select/u);
    assert.throws(() => readFileSync(configPath, "utf-8"), /ENOENT/u);
  } finally {
    cleanup();
  }
});

test("hotkeys modal uses editing design while capturing a replacement key", () => {
  const { keybindings, cleanup } = createKeybindings();
  try {
    const modal = new HotkeysModal(createTestTheme(), keybindings, [], () => undefined);

    modal.setFilterQuery("model");
    modal.handleInput("\r");
    const output = modal.render(100).join("\n");

    assert.match(output, /● Open model selector\s+Ctrl \+ L/u);
    assert.match(output, /Editing app\.model\.select: press the replacement key/u);
  } finally {
    cleanup();
  }
});

test("hotkeys modal can override every resolved keybinding id", () => {
  const { keybindings, configPath, cleanup } = createKeybindings();
  try {
    for (const [query, key] of [["submit", "\u0003"], ["model", "b"]] as const) {
      const modal = new HotkeysModal(createTestTheme(), keybindings, [], () => undefined);
      modal.setFilterQuery(query);
      modal.handleInput("\r");
      modal.handleInput(key);
    }

    assert.deepEqual(JSON.parse(readFileSync(configPath, "utf-8")), {
      "app.model.select": "b",
      "tui.input.submit": "ctrl+c",
    });
  } finally {
    cleanup();
  }
});

test("hotkeys modal asks before overriding a conflicting hotkey", () => {
  const { keybindings, configPath, cleanup } = createKeybindings();
  try {
    const modal = new HotkeysModal(createTestTheme(), keybindings, [], () => undefined);

    modal.setFilterQuery("model");
    modal.handleInput("\r");
    modal.handleInput("\r");

    assert.match(modal.render(100).join("\n"), /Hotkey conflict/u);
    assert.match(modal.render(100).join("\n"), /tui\.input\.submit already uses enter/u);
    assert.throws(() => readFileSync(configPath, "utf-8"), /ENOENT/u);

    modal.handleInput("\r");
    assert.deepEqual(JSON.parse(readFileSync(configPath, "utf-8")), {
      "app.model.select": "enter",
      "tui.input.submit": [],
    });
  } finally {
    cleanup();
  }
});
