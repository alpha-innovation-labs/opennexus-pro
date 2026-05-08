import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { SlashMenuModal } from "../../../packages/extensions/src/slash-menu/SlashMenuModal.js";
import { clearRegisteredSlashCommands, registerSlashCommand } from "../../../packages/extensions/src/slash-menu/registerSlashCommand.js";
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
      authStorage: { get: () => undefined, hasAuth: () => false, list: () => [] },
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

test("slash menu renders top-level custom commands individually while keeping the resources submenu", async () => {
  const commands = () => [
    { name: "prompt:plan", description: "Plan prompt description", source: "prompt", sourceInfo: { scope: "project" } },
    { name: "prompt:review", description: "Review prompt description", source: "prompt", sourceInfo: { scope: "project" } },
    { name: "skill:debug", description: "Debug skill description", source: "skill", sourceInfo: { scope: "project" } },
  ] as never;
  const modal = new SlashMenuModal(createContext() as never, () => "medium", () => undefined, () => undefined, () => undefined, () => undefined, commands);

  modal.setQuery("prompt");
  await modal.refresh();
  const output = (await renderComponentInVirtualTerminal(() => modal, 120, 30)).join("\n");

  assert.match(output, /Resources/u);
  assert.match(output, /Custom Commands/u);
  assert.match(output, /› custom commands/u);
  assert.match(output, /› prompt:plan/u);
  assert.match(output, /› prompt:review/u);
  assert.doesNotMatch(output, /skill:debug/u);
});

test("slash menu opens custom command and skill submenus", async () => {
  const sourceDir = await mkdtemp(join(tmpdir(), "nexus-menu-resource-"));
  const promptPath = join(sourceDir, "prompt.md");
  const skillPath = join(sourceDir, "SKILL.md");
  await writeFile(promptPath, "# Prompt Review\n\nFull prompt markdown body from file.", "utf8");
  await writeFile(skillPath, "# Debug Skill\n\nFull skill markdown body from file.", "utf8");
  const commands = () => [
    { name: "prompt:review", description: "Review prompt description", source: "prompt", sourceInfo: { scope: "project", source: "project", origin: "top-level", path: promptPath } },
    { name: "skill:debug", description: "Debug skill description", source: "skill", sourceInfo: { scope: "project", source: "project", origin: "top-level", path: skillPath } },
    { name: "skill:supercalifragilisticexpialidocious", description: "Long skill description", source: "skill", sourceInfo: { scope: "project", source: "project", origin: "top-level", path: skillPath } },
  ] as never;
  let submitted = "";
  const modal = new SlashMenuModal(createContext() as never, () => "medium", () => undefined, () => undefined, () => undefined, (value) => { submitted = value; }, commands);

  modal.setQuery("custom");
  await modal.refresh();
  modal.handleInput("\r");
  await Promise.resolve();
  let output = (await renderComponentInVirtualTerminal(() => modal, 120, 30)).join("\n");
  assert.match(output, /Custom Commands/u);
  assert.match(output, /● All \[1\].*○ Global \[2\].*○ Local \[3\]/u);
  assert.doesNotMatch(output, /Details/u);
  assert.match(output, /›  prompt:review/u);
  assert.match(output, /\s1 ┊ Prompt Review/u);
  assert.match(output, /Full prompt markdown body from file/u);
  assert.match(output, /List\s+· Tab details/u);
  assert.match(output, /─{10,}/u);
  assert.doesNotMatch(output, /Review prompt description/u);
  modal.handleInput("\t");
  modal.handleInput("j");
  output = (await renderComponentInVirtualTerminal(() => modal, 120, 30)).join("\n");
  assert.match(output, /Detail\s+· Tab list · j\/k scroll · Ctrl\+D\/Ctrl\+U page/u);
  assert.doesNotMatch(output, /List · Tab details · j\/k/u);
  assert.match(output, /Search > \/\s/u);
  modal.handleInput("\t");
  modal.handleInput("\r");
  assert.equal(submitted, "/prompt:review ");

  submitted = "";
  const skillsModal = new SlashMenuModal(createContext() as never, () => "medium", () => undefined, () => undefined, () => undefined, (value) => { submitted = value; }, commands);
  skillsModal.setQuery("skills");
  await skillsModal.refresh();
  let topOutput = (await renderComponentInVirtualTerminal(() => skillsModal, 120, 30)).join("\n");
  assert.match(topOutput, /› skills/u);
  assert.doesNotMatch(topOutput, /skill:debug/u);
  skillsModal.handleInput("\r");
  await Promise.resolve();
  output = (await renderComponentInVirtualTerminal(() => skillsModal, 120, 30)).join("\n");
  assert.match(output, /Skills/u);
  assert.match(output, /● All \[1\].*○ Global \[2\].*○ Local \[3\]/u);
  assert.doesNotMatch(output, /Details/u);
  assert.match(output, /›  debug/u);
  assert.match(output, /supercalifragilisticexpialidocious/u);
  assert.doesNotMatch(output, /›  skill:debug/u);
  assert.doesNotMatch(output, /skill:supercalifragilisticexpialidocious/u);
  assert.match(output, /\s1 ┊ Debug Skill/u);
  assert.match(output, /Full skill markdown body from file/u);
  assert.doesNotMatch(output, /Debug skill description/u);
  skillsModal.handleInput("\r");
  assert.equal(submitted, "/skill:debug");
});

test("resource command submenus filter local and global scopes with number keys", async () => {
  const sourceDir = await mkdtemp(join(tmpdir(), "nexus-menu-scope-"));
  const localPrompt = join(sourceDir, "local.md");
  const globalPrompt = join(sourceDir, "global.md");
  await writeFile(localPrompt, "# Local Prompt", "utf8");
  await writeFile(globalPrompt, "# Global Prompt", "utf8");
  const commands = () => [
    { name: "prompt:local", description: "Local", source: "prompt", sourceInfo: { scope: "project", source: "project", origin: "top-level", path: localPrompt } },
    { name: "prompt:global", description: "Global", source: "prompt", sourceInfo: { scope: "user", source: "user", origin: "top-level", path: globalPrompt } },
  ] as never;
  const modal = new SlashMenuModal(createContext() as never, () => "medium", () => undefined, () => undefined, () => undefined, () => undefined, commands);

  modal.setQuery("custom");
  await modal.refresh();
  modal.handleInput("\r");
  await Promise.resolve();
  let output = (await renderComponentInVirtualTerminal(() => modal, 120, 30)).join("\n");
  assert.match(output, /● All \[1\]/u);
  assert.match(output, /prompt:local/u);
  assert.match(output, /prompt:global/u);

  modal.handleInput("2");
  await Promise.resolve();
  output = (await renderComponentInVirtualTerminal(() => modal, 120, 30)).join("\n");
  assert.match(output, /● Global \[2\]/u);
  assert.match(output, / prompt:global/u);
  assert.doesNotMatch(output, /prompt:local/u);

  modal.handleInput("3");
  await Promise.resolve();
  output = (await renderComponentInVirtualTerminal(() => modal, 120, 30)).join("\n");
  assert.match(output, /● Local \[3\]/u);
  assert.match(output, / prompt:local/u);
  assert.doesNotMatch(output, /prompt:global/u);
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

  assert.match(output, /◇ Anthropic/);
  assert.doesNotMatch(output, /Preview/);
  assert.doesNotMatch(output, /anthropic\s*│/);
});

test("model menu redirects to login when no provider models are available", async () => {
  const modal = new SlashMenuModal(createContext([]) as never, () => "medium", () => undefined, () => undefined, () => undefined, () => undefined);

  await modal.openLevel("model");
  const output = (await renderComponentInVirtualTerminal(() => modal, 120, 30)).join("\n");

  assert.match(output, /Login/);
  assert.match(output, /◇ Anthropic/);
  assert.doesNotMatch(output, /No matching items/);
});

test("slash submenus stay single-pane except resume transcript preview", async () => {
  const singlePaneLevels = ["theme", "scoped-models", "fork", "login", "logout"] as const;

  for (const level of singlePaneLevels) {
    const modal = new SlashMenuModal(createContext() as never, () => "medium", () => undefined, () => undefined, () => undefined, () => undefined);
    await modal.openLevel(level);
    const output = (await renderComponentInVirtualTerminal(() => modal, 120, 30)).join("\n");
    assert.doesNotMatch(output, /Preview/, `${level} should not render a preview pane`);
  }
});
