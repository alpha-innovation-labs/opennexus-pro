import assert from "node:assert/strict";
import test from "node:test";
import { createExtensionFeatureFlags } from "../../../packages/feature-flags/src/createExtensionFeatureFlags.js";
import { getBundledFeatureFlagsConfig } from "../../../packages/feature-flags/src/getBundledFeatureFlagsConfig.js";
import { compiledBundledExtensionIds } from "../../../packages/extensions/src/generated/registerCompiledEnabledExtensions.js";
import { registerAskUserQuestionExtension } from "../../../packages/extensions/src/ask-user-question/registerAskUserQuestionExtension.js";
import { registerTodoExtension } from "../../../packages/extensions/src/todo/registerTodoExtension.js";

/**
 * Creates a minimal extension API test double that records registrations.
 *
 * @returns Test API and captured registrations.
 */
function createRecordingExtensionApi() {
  const tools: string[] = [];
  const commands: string[] = [];
  const events: string[] = [];
  const api = new Proxy({}, {
    get(_target, property) {
      if (property === "registerTool") return (tool: { name: string }) => tools.push(tool.name);
      if (property === "registerCommand") return (name: string) => commands.push(name);
      if (property === "on") return (event: string) => events.push(event);
      if (property === "events") return { on() {}, emit() {} };
      return () => undefined;
    },
  });
  return { api, tools, commands, events };
}

test("todo and ask-user-question are native Nexus feature flags", () => {
  const flags = createExtensionFeatureFlags();
  const byId = new Map(flags.map((entry) => [entry.id, entry]));
  const config = getBundledFeatureFlagsConfig();

  assert.equal(byId.get("todo")?.enabled, true);
  assert.equal(config.extensions.todo?.category, "extension");
  assert.equal(byId.get("ask-user-question")?.enabled, true);
  assert.equal(config.extensions["ask-user-question"]?.category, "extension");
  assert.equal(byId.has("rpiv-todo"), false);
  assert.equal(byId.has("rpiv-ask-user-question"), false);
});

test("compiled bundle includes native todo ids instead of rpiv ids", () => {
  assert.equal(compiledBundledExtensionIds.includes("todo"), true);
  assert.equal(compiledBundledExtensionIds.includes("ask-user-question"), true);
  assert.equal(compiledBundledExtensionIds.includes("rpiv-todo" as never), false);
  assert.equal(compiledBundledExtensionIds.includes("rpiv-ask-user-question" as never), false);
});

test("native todo and ask-user-question extensions register their tools", () => {
  const { api, tools, commands, events } = createRecordingExtensionApi();

  registerTodoExtension(api as never);
  registerAskUserQuestionExtension(api as never);

  assert.deepEqual(tools, ["todo", "ask_user_question"]);
  assert.deepEqual(commands, ["todos"]);
  assert.deepEqual(events, ["session_start", "session_compact", "session_tree", "session_shutdown", "tool_execution_end", "agent_start"]);
});
