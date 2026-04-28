import assert from "node:assert/strict";
import test from "node:test";
import { SlashMenuModal } from "../../../packages/extensions/src/neo-editor/features/menu/SlashMenuModal.js";
import { getSettingsRootLeaf } from "../../../packages/extensions/src/neo-editor/features/menu/getSettingsRootLeaf.js";
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

/**
 * Removes ANSI escape codes from rendered terminal output.
 *
 * @param value Rendered text.
 * @returns Plain text.
 */
function stripAnsi(value: string): string {
  return value.replace(/\u001b\[[0-9;]*m/g, "");
}

/**
 * Finds the index where the current setting value starts.
 *
 * @param line Rendered settings row.
 * @param label Setting label.
 * @returns Value column index.
 */
function findSettingsValueColumn(line: string, label: string): number {
  const suffix = line.slice(line.indexOf(label) + label.length);
  const match = suffix.match(/\S/);
  return match ? line.indexOf(label) + label.length + match.index! : -1;
}

/**
 * Waits for slash-menu async enter handlers to settle.
 */
async function flushSlashMenuInput(): Promise<void> {
  await new Promise((resolve) => setImmediate(resolve));
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

  modal.setQuery("settings");
  await modal.refresh();
  modal.handleInput("\r");
  const viewport = await renderComponentInVirtualTerminal(() => modal, 120, 50);

  const output = stripAnsi(viewport.join("\n"));
  const firstBorderLine = output.split("\n").find((line) => line.includes("┌")) ?? "";
  const autoCompactLine = output.split("\n").find((line) => line.includes("Auto-compact")) ?? "";
  const showImagesLine = output.split("\n").find((line) => line.includes("Show images")) ?? "";

  assert.equal(picked, "");
  assert.match(output, /Auto-compact/);
  assert.doesNotMatch(output, /Preview/);
  assert.ok(firstBorderLine.trim().length < 80);
  assert.equal(findSettingsValueColumn(autoCompactLine, "Auto-compact"), findSettingsValueColumn(showImagesLine, "Show images"));
});

test("root thinking item opens thinking choices from the Auth group", async () => {
  let picked = "";
  let thinkingLevel = "medium";
  const modal = new SlashMenuModal({ ...createContext(), model: { id: "gpt-5", reasoning: true } } as never, () => thinkingLevel, (value) => { thinkingLevel = value; }, () => undefined, () => undefined, (commandText: string) => {
    picked = commandText;
  });

  modal.setQuery("thinking");
  await modal.refresh();
  modal.handleInput("\r");
  await flushSlashMenuInput();
  let output = stripAnsi((await renderComponentInVirtualTerminal(() => modal, 120, 50)).join("\n"));

  assert.equal(picked, "");
  assert.match(output, /Settings > Thinking level/);
  assert.match(output, /◉ medium/);
  assert.match(output, /○ high/);

  modal.handleInput("\u001b[B");
  modal.handleInput("\r");
  await flushSlashMenuInput();
  output = stripAnsi((await renderComponentInVirtualTerminal(() => modal, 120, 50)).join("\n"));

  assert.equal(thinkingLevel, "high");
  assert.match(output, /Menu/);
  assert.match(output, /thinking/);
});

test("settings options open a choice submenu and keep the settings cursor after update", async () => {
  let thinkingLevel = "medium";
  const modal = new SlashMenuModal({ ...createContext(), model: { id: "gpt-5", reasoning: true } } as never, () => thinkingLevel, (value) => { thinkingLevel = value; }, () => undefined, () => undefined, () => undefined);

  await modal.openLevel("settings");
  modal.setQuery("thinking");
  await modal.refresh();
  modal.handleInput("\r");
  await flushSlashMenuInput();
  let output = stripAnsi((await renderComponentInVirtualTerminal(() => modal, 120, 50)).join("\n"));

  assert.match(output, /Settings > Thinking level/);
  assert.match(output, /◉ medium/);
  assert.match(output, /○ high/);

  modal.handleInput("\u001b[B");
  modal.handleInput("\r");
  await flushSlashMenuInput();
  assert.equal(thinkingLevel, "high");

  modal.handleInput("\r");
  await flushSlashMenuInput();
  output = stripAnsi((await renderComponentInVirtualTerminal(() => modal, 120, 50)).join("\n"));
  assert.match(output, /Settings > Thinking level/);
  assert.match(output, /◉ high/);
});
