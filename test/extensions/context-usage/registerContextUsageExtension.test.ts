import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createAgentsItems } from "../../../packages/extensions/src/context-usage/createAgentsItems.js";
import { createContextUsageReport } from "../../../packages/extensions/src/context-usage/createContextUsageReport.js";
import { createRuntimeSnapshot } from "../../../packages/extensions/src/context-usage/createRuntimeSnapshot.js";
import { createSkillItems } from "../../../packages/extensions/src/context-usage/createSkillItems.js";
import { registerContextUsageExtension } from "../../../packages/extensions/src/context-usage/registerContextUsageExtension.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

/**
 * Creates a command/tool context with live context usage fixtures.
 *
 * @returns Mock context for context usage tests.
 */
function createContextUsageMockContext(): Record<string, unknown> {
  return {
    hasUI: true,
    model: { id: "minimax-m2p7", name: "MiniMax-M2.7", contextWindow: 200000 },
    getSystemPrompt() {
      return [
        "System prompt",
        "Available tools:",
        "- read: Read files",
        "- mcp__playwright__browser_click: Click page elements",
        "",
        "In addition to the tools above, you may have access to other custom tools depending on the project.",
        "",
        "# Project Context",
        "",
        "## /repo/AGENTS.md",
        "",
        "Project guidance",
        "",
        "The following skills provide specialized instructions for specific tasks.",
        "<available_skills>",
        "  <skill>",
        "    <name>agent-browser</name>",
        "    <description>Browser automation</description>",
        "    <location>/skills/agent-browser/SKILL.md</location>",
        "  </skill>",
        "</available_skills>",
      ].join("\n");
    },
    getContextUsage() {
      return { tokens: 60000, contextWindow: 200000, percent: 30 };
    },
    sessionManager: {
      getBranch() {
        return [{ type: "message", message: { role: "user", content: [{ type: "text", text: "hello" }] } }];
      },
    },
    ui: { notify() {} },
  };
}

test("context usage extension registers a tool that reports current context usage", async () => {
  let registeredTool:
    | {
        name: string;
        execute: (...args: unknown[]) => Promise<{ content: Array<{ type: string; text: string }>; details?: unknown }>;
      }
    | undefined;

  registerContextUsageExtension({
    on() {},
    registerCommand() {},
    registerTool(tool: {
      name: string;
      execute: (...args: unknown[]) => Promise<{ content: Array<{ type: string; text: string }>; details?: unknown }>;
    }) {
      registeredTool = tool;
    },
  } as never);

  assert.ok(registeredTool);
  assert.equal(registeredTool.name, "context_usage");

  const result = await registeredTool.execute("tool-1", {}, undefined, undefined, createContextUsageMockContext());

  assert.equal(result.content[0]?.type, "text");
  assert.match(result.content[0]?.text ?? "", /Context Usage/u);
  assert.match(result.content[0]?.text ?? "", /MiniMax-M2\.7/u);
  assert.match(result.content[0]?.text ?? "", /MiniMax-M2\.7.*60k\/200k tokens \(30\.0%\)/u);
  assert.match(result.content[0]?.text ?? "", /MiniMax-M2\.7[^\n]*\n\n.*Estimated usage by category/us);
  assert.match(result.content[0]?.text ?? "", /├─ ⛁ System prompt/u);
  assert.equal(result.details, undefined);
});

test("context usage extension registers /context command", async () => {
  let commandHandler: ((args: string, ctx: never) => Promise<void>) | undefined;
  let modalOutput = "";

  registerContextUsageExtension({
    on() {},
    registerTool() {},
    registerCommand(name: string, definition: { handler: (args: string, ctx: never) => Promise<void> }) {
      assert.equal(name, "context");
      commandHandler = definition.handler;
    },
  } as never);

  assert.ok(commandHandler);
  await commandHandler("", {
    ...createContextUsageMockContext(),
    ui: {
      async custom(factory: (tui: unknown, theme: unknown, keybindings: unknown, done: () => void) => { render(width: number): string[] }) {
        modalOutput = factory(undefined, createTestTheme(), undefined, () => undefined).render(120).join("\n");
      },
      notify() {},
    },
  } as never);

  assert.match(modalOutput, /Context Usage/u);
  assert.match(modalOutput, /System tools/u);
  assert.match(modalOutput, /└─ read:/u);
  assert.match(modalOutput, /MCP tools · \/mcp/u);
  assert.doesNotMatch(modalOutput, /loaded by Pi/u);
  assert.match(modalOutput, /\/repo\/AGENTS.md/u);
  assert.match(modalOutput, /Skills · \/skills/u);
  assert.match(modalOutput, /└─ agent-browser/u);
  assert.match(modalOutput, /mcp__playwright__browser_click/u);
  assert.match(modalOutput, /Autocompact buffer/u);
});


test("context usage tool list follows the rendered system prompt before Pi built-in fallback", async () => {
  const report = await createContextUsageReport({
    usage: null,
    modelName: "MiniMax-M2.7",
    systemPrompt: [
      "Available tools:",
      "- context_usage: Inspect context.",
      "- ask_user_question: Ask structured questions.",
      "",
      "In addition to the tools above, you may have access to other custom tools depending on the project.",
    ].join("\n"),
    systemPromptOptions: { cwd: process.cwd(), toolSnippets: { read: "Read file contents" }, selectedTools: ["read"] },
    messages: [],
  });

  assert.deepEqual(report.systemTools.map((tool) => tool.label), ["context_usage", "ask_user_question"]);
});

test("context usage snapshot ignores impossible tiny usage context windows", () => {
  const snapshot = createRuntimeSnapshot({
    ...createContextUsageMockContext(),
    getContextUsage() {
      return { tokens: 0, contextWindow: 272, percent: 0 };
    },
  } as never);

  assert.deepEqual(snapshot.usage, { tokens: null, contextWindow: 200000, percent: null });
});

test("context usage AGENTS totals prefer full disk content over rendered prompt snippets", () => {
  const directory = mkdtempSync(join(tmpdir(), "nexus-agents-context-"));
  const agentsPath = join(directory, "AGENTS.md");
  const content = "# AGENTS\n\nUse deterministic tests. Keep Nexus branding. Avoid source exposure.\n";
  writeFileSync(agentsPath, content, "utf8");

  const items = createAgentsItems({ cwd: directory, contextFiles: [{ path: agentsPath, content: "" }] } as never, `## ${agentsPath}\n# Tiny`);

  assert.equal(items[0]?.label, agentsPath);
  assert.equal(items[0]?.tokens, Math.ceil(content.length / 4));
});

test("context usage AGENTS parser accepts a single newline after the file header", () => {
  const items = createAgentsItems(undefined, "## /repo/AGENTS.md\n# AGENTS\n\nUse deterministic tests. Keep Nexus branding.\n\nThe following skills");

  assert.equal(items[0]?.label, "/repo/AGENTS.md");
  assert.ok((items[0]?.tokens ?? 0) > 10);
});

test("context usage skill totals measure the rendered prompt entry", async () => {
  const items = await createSkillItems({
    cwd: "/repo",
    skills: [{ name: "nexus", description: "Use this skill when you need a source-backed map of the Nexus codebase.", filePath: "/repo/.agents/skills/nexus/SKILL.md", baseDir: "/repo/.agents/skills/nexus", sourceInfo: { source: "local" } as never, disableModelInvocation: false }],
  });

  assert.equal(items[0]?.label, "nexus");
  assert.ok((items[0]?.tokens ?? 0) > 40);
  assert.ok((items[0]?.tokens ?? 0) < 90);
});
