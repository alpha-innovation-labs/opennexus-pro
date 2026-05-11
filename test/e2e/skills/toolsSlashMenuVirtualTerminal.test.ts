import assert from "node:assert/strict";
import stripAnsi from "strip-ansi";
import test from "node:test";
import { SlashMenuModal } from "../../../packages/extensions/src/slash-menu/SlashMenuModal.js";
import { clearRegisteredSlashCommands, registerSlashCommand } from "../../../packages/extensions/src/slash-menu/registerSlashCommand.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

/** Creates the minimum slash-menu context for /tools rendering. */
function createContext() {
  return {
    cwd: process.cwd(),
    ui: { theme: createTestTheme(), notify: () => undefined },
    model: { provider: "anthropic", id: "claude-3" },
    getSystemPrompt: () => "Available tools:\n- ignored: This text must not be parsed by /tools.\n\nIn addition to the tools above, custom tools may exist.",
    modelRegistry: { getAvailable: () => [], authStorage: { get: () => undefined, hasAuth: () => false, list: () => [] } },
    sessionManager: { getEntries: () => [], getSessionDir: () => ".pi/agent/sessions", getTree: () => [] },
  };
}

/** Returns deterministic dynamic skill commands for the slash menu. */
function getCommands() {
  return [
    {
      name: "skill:linear-cli",
      description: "Manage Linear issues.",
      source: "skill",
      sourceInfo: { scope: "project", source: "project", origin: "top-level", path: ".agents/skills/linear-cli/SKILL.md" },
    },
  ] as never;
}

/** Returns no structured tools to exercise the system-prompt fallback used by live startup. */
function getAllTools() {
  return [] as never;
}

/** Returns deterministic structured tool metadata with extension source information. */
function getGroupedTools() {
  return [
    {
      name: "web_search",
      description: "Search the web using Perplexity AI, Exa, or Gemini.",
      parameters: {},
      sourceInfo: { scope: "project", source: "project", origin: "top-level", path: "packages/extensions/src/vendor/websearch/index.ts" },
    },
    {
      name: "fetch_content",
      description: "Fetch URLs as readable markdown.",
      parameters: {},
      sourceInfo: { scope: "project", source: "project", origin: "top-level", path: "packages/extensions/src/vendor/websearch/index.ts" },
    },
  ] as never;
}

/** Returns deterministic third-party extension and skill commands for the slash menu. */
function getCommandsWithExtension() {
  return [
    {
      name: "ps",
      description: "View and manage all background processes.",
      source: "extension",
      sourceInfo: { scope: "user", source: "npm:@aliou/pi-processes", origin: "package", path: "/opt/homebrew/lib/node_modules/@aliou/pi-processes/src/index.ts" },
    },
    {
      name: "nexus-model-select",
      description: "Hidden Nexus selector action.",
      source: "extension",
      sourceInfo: { scope: "user", source: "runtime", origin: "package", path: "nexus:internal" },
    },
    ...getCommands(),
  ] as never;
}

test("third-party extension commands from Pi getCommands appear in the slash menu", async () => {
  const picked: string[] = [];
  const modal = new SlashMenuModal(createContext() as never, () => "medium", () => undefined, () => undefined, () => undefined, (command) => { picked.push(command); }, getCommandsWithExtension);

  await modal.refresh();
  const fullOutput = stripAnsi((await renderComponentInVirtualTerminal(() => modal, 120, 35)).join("\n"));
  assert.doesNotMatch(fullOutput, /nexus-model-select/u);

  modal.setQuery("ps");
  await modal.refresh();
  const output = stripAnsi((await renderComponentInVirtualTerminal(() => modal, 120, 35)).join("\n"));

  assert.match(output, /ps/u);
  assert.match(output, /View and manage all background processes/u);
  assert.doesNotMatch(output, /nexus-model-select/u);

  modal.handleInput("\r");
  assert.deepEqual(picked, ["/ps"]);
});

test("locally registered nexus-prefixed commands stay hidden in wterm", async () => {
  clearRegisteredSlashCommands();
  registerSlashCommand({ name: "nexus-fork-select", description: "Hidden Nexus selector action.", source: "extension" });
  registerSlashCommand({ name: "ps", description: "View and manage background processes", source: "extension" });
  try {
    const modal = new SlashMenuModal(createContext() as never, () => "medium", () => undefined, () => undefined, () => undefined, () => undefined, getCommands);

    modal.setQuery("nexus");
    await modal.refresh();
    const nexusOutput = stripAnsi((await renderComponentInVirtualTerminal(() => modal, 120, 35)).join("\n"));
    assert.doesNotMatch(nexusOutput, /nexus-fork-select/u);

    modal.setQuery("ps");
    await modal.refresh();
    const psOutput = stripAnsi((await renderComponentInVirtualTerminal(() => modal, 120, 35)).join("\n"));
    assert.match(psOutput, /ps/u);
  } finally {
    clearRegisteredSlashCommands();
  }
});

test("/tools groups structured extension tools by caller in wterm", async () => {
  const modal = new SlashMenuModal(createContext() as never, () => "medium", () => undefined, () => undefined, () => undefined, () => undefined, getCommands, undefined, undefined, getGroupedTools);

  modal.setQuery("tools");
  await modal.refresh();
  modal.handleInput("\r");
  await Promise.resolve();

  const groupOutput = stripAnsi((await renderComponentInVirtualTerminal(() => modal, 120, 35)).join("\n"));
  const coreIndex = groupOutput.indexOf("Core");
  const webSearchIndex = groupOutput.indexOf("Web Search");

  assert.ok(coreIndex >= 0, "built-in tools are grouped under Core");
  assert.ok(webSearchIndex > coreIndex, "extension tools render under the extension group");

  modal.setQuery("web search");
  await modal.refresh();
  modal.handleInput("\r");
  await Promise.resolve();

  const toolsOutput = stripAnsi((await renderComponentInVirtualTerminal(() => modal, 120, 35)).join("\n"));
  assert.match(toolsOutput, /fetch_content/u);
  assert.match(toolsOutput, /web_search/u);
});

test("/tools appears below skills and opens the available tools list in wterm", async () => {
  const modal = new SlashMenuModal(createContext() as never, () => "medium", () => undefined, () => undefined, () => undefined, () => undefined, getCommands, undefined, undefined, getAllTools);

  await modal.refresh();
  const topOutput = stripAnsi((await renderComponentInVirtualTerminal(() => modal, 120, 35)).join("\n"));
  const skillsIndex = topOutput.indexOf("skills");
  const toolsIndex = topOutput.indexOf("tools");

  assert.ok(skillsIndex >= 0, "top-level Resources includes skills");
  assert.ok(toolsIndex > skillsIndex, "top-level Resources renders tools under skills");

  modal.setQuery("tools");
  await modal.refresh();
  modal.handleInput("\r");
  await Promise.resolve();

  const groupOutput = stripAnsi((await renderComponentInVirtualTerminal(() => modal, 120, 35)).join("\n"));
  assert.match(groupOutput, /Tools/u);
  assert.match(groupOutput, /Core/u);

  modal.setQuery("core");
  await modal.refresh();
  modal.handleInput("\r");
  await Promise.resolve();

  const toolsOutput = stripAnsi((await renderComponentInVirtualTerminal(() => modal, 120, 35)).join("\n"));
  assert.match(toolsOutput, /bash/u);
  assert.match(toolsOutput, /Execute bash/u);
  assert.match(toolsOutput, /read/u);
  assert.match(toolsOutput, /Read file con/u);
  assert.doesNotMatch(toolsOutput, /ignored/u);
});
