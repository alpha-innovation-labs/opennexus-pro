import assert from "node:assert/strict";
import test from "node:test";
import { SlashMenuModal } from "../../../packages/extensions/src/neo-editor/features/menu/SlashMenuModal.js";
import { clearRegisteredSlashCommands, registerSlashCommand } from "../../../packages/extensions/src/neo-editor/features/menu/registerSlashCommand.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

/**
 * Creates the minimum slash-menu context needed for rendering tests.
 *
 * @returns Fake extension context.
 */
function createContext(models = [
  { provider: "openai", id: "gpt-5", name: "GPT 5" },
  { provider: "anthropic", id: "claude-3", name: "Claude 3" },
]) {
  return {
    cwd: process.cwd(),
    ui: {
      theme: createTestTheme(),
      notify: () => undefined,
    },
    model: { provider: "anthropic", id: "claude-3" },
    modelRegistry: {
      getAvailable: () => models,
      authStorage: { get: () => undefined },
    },
    sessionManager: {
      getEntries: () => [{ id: "entry-1", type: "message", message: { role: "user", content: "Fork from this message" } }],
      getSessionDir: () => ".pi/agent/sessions",
      getTree: () => [{ entry: { id: "tree-1", type: "message", parentId: null, message: { role: "user", content: "Tree message" } }, children: [] }],
    },
  };
}

test.beforeEach(() => {
  clearRegisteredSlashCommands();
});

test.after(() => {
  clearRegisteredSlashCommands();
});

test("slash menu renders filtered command rows without preview in the virtual terminal", async () => {
  const modal = new SlashMenuModal(createContext() as never, () => "medium", () => undefined, () => undefined, () => undefined, () => undefined);

  modal.setQuery("for");
  await modal.refresh();
  const output = (await renderComponentInVirtualTerminal(() => modal, 120, 30)).join("\n");

  assert.match(output, /Menu/);
  assert.doesNotMatch(output, /Preview/);
  assert.match(output, /> \/for/);
  assert.match(output, /⑂ fork/);
  assert.doesNotMatch(output, /\/fork/);
  assert.doesNotMatch(output, /\/settings/);
});

test("slash menu filters against labels and values only", async () => {
  const modal = new SlashMenuModal(createContext() as never, () => "medium", () => undefined, () => undefined, () => undefined, () => undefined);

  modal.setQuery("name");
  await modal.refresh();
  const output = (await renderComponentInVirtualTerminal(() => modal, 120, 30)).join("\n");

  assert.match(output, /✎ name/);
  assert.doesNotMatch(output, /clone/);
  assert.doesNotMatch(output, /new/);
  assert.doesNotMatch(output, /settings/);
});

test("slash menu renders grouped top-level rows", async () => {
  registerSlashCommand({ name: "aaa-extension", description: "Extension command", source: "extension" });
  const modal = new SlashMenuModal(createContext() as never, () => "medium", () => undefined, () => undefined, () => undefined, () => undefined);

  modal.setQuery("aaa");
  await modal.refresh();
  const output = (await renderComponentInVirtualTerminal(() => modal, 120, 30)).join("\n");

  assert.match(output, /Extensions/);
  assert.match(output, /✦ aaa-extension/);
});

test("slash menu opens separate prompt and skill command menus", async () => {
  const commands = () => [
    { name: "prompt:review", description: "Review prompt", source: "prompt", sourceInfo: { type: "project", path: "prompt.md" } },
    { name: "skill:debug", description: "Debug skill", source: "skill", sourceInfo: { type: "project", path: "SKILL.md" } },
  ] as never;
  let submitted = "";
  const modal = new SlashMenuModal(createContext() as never, () => "medium", () => undefined, () => undefined, () => undefined, (value) => { submitted = value; }, commands);

  modal.setQuery("prompts");
  await modal.refresh();
  modal.handleInput("\r");
  await Promise.resolve();
  let output = (await renderComponentInVirtualTerminal(() => modal, 120, 30)).join("\n");
  assert.match(output, /Prompts/u);
  assert.match(output, /> prompt:review/u);
  modal.handleInput("\r");
  assert.equal(submitted, "/prompt:review");

  submitted = "";
  const skillsModal = new SlashMenuModal(createContext() as never, () => "medium", () => undefined, () => undefined, () => undefined, (value) => { submitted = value; }, commands);
  skillsModal.setQuery("skills");
  await skillsModal.refresh();
  skillsModal.handleInput("\r");
  await Promise.resolve();
  output = (await renderComponentInVirtualTerminal(() => skillsModal, 120, 30)).join("\n");
  assert.match(output, /Skills/u);
  assert.match(output, /> skill:debug/u);
  skillsModal.handleInput("\r");
  assert.equal(submitted, "/skill:debug");
});

test("model menu renders provider groups without preview", async () => {
  const modal = new SlashMenuModal(createContext() as never, () => "medium", () => undefined, () => undefined, () => undefined, () => undefined);

  await modal.openLevel("model");
  const output = (await renderComponentInVirtualTerminal(() => modal, 120, 30)).join("\n");

  assert.match(output, /anthropic/);
  assert.match(output, /openai/);
  assert.match(output, /• claude-3/);
  assert.doesNotMatch(output, /GPT 5/);
  assert.doesNotMatch(output, /Preview/);
});

test("login menu renders as a single pane without provider id preview", async () => {
  const modal = new SlashMenuModal(createContext() as never, () => "medium", () => undefined, () => undefined, () => undefined, () => undefined);

  await modal.openLevel("login");
  const output = (await renderComponentInVirtualTerminal(() => modal, 120, 30)).join("\n");

  assert.match(output, /◆ Anthropic/);
  assert.doesNotMatch(output, /Preview/);
  assert.doesNotMatch(output, /anthropic\s*│/);
});

test("model menu redirects to login when no provider models are available", async () => {
  const modal = new SlashMenuModal(createContext([]) as never, () => "medium", () => undefined, () => undefined, () => undefined, () => undefined);

  await modal.openLevel("model");
  const output = (await renderComponentInVirtualTerminal(() => modal, 120, 30)).join("\n");

  assert.match(output, /Login/);
  assert.match(output, /◆ Anthropic/);
  assert.doesNotMatch(output, /No matching items/);
});

test("slash submenus stay single-pane except resume transcript preview", async () => {
  const singlePaneLevels = ["theme", "scoped-models", "fork", "tree", "tree-summary", "login", "logout"] as const;

  for (const level of singlePaneLevels) {
    const modal = new SlashMenuModal(createContext() as never, () => "medium", () => undefined, () => undefined, () => undefined, () => undefined);
    await modal.openLevel(level);
    const output = (await renderComponentInVirtualTerminal(() => modal, 120, 30)).join("\n");
    assert.doesNotMatch(output, /Preview/, `${level} should not render a preview pane`);
  }
});
