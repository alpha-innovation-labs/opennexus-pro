import assert from "node:assert/strict";
import test from "node:test";
import { getAgentConfig, getAvailableTypes, getConfig, getDefaultAgentNames, getToolsForType, isValidType, registerAgents } from "../../../packages/extensions/src/sub-agents/agent-types.js";

/**
 * Resets the bundled agent registry before each assertion group.
 */
test.beforeEach(() => {
  registerAgents(new Map());
});

/**
 * Verifies the bundled registry exposes current default agents and excludes legacy defaults.
 */
test("registerAgents seeds bundled default agents and excludes legacy defaults", () => {
  assert.deepEqual(getAvailableTypes(), ["Librarian", "Engineer"]);
  assert.deepEqual(getDefaultAgentNames(), ["Librarian", "Engineer"]);
  assert.equal(isValidType("Librarian"), true);
  assert.equal(isValidType("general-purpose"), false);
  assert.equal(isValidType("Explore"), false);
  assert.equal(isValidType("Plan"), false);
});

/**
 * Verifies unknown agent names fall back to the bundled Librarian configuration.
 */
test("getAgentConfig and getConfig fall back to Librarian", () => {
  const agentConfig = getAgentConfig("general-purpose");
  const viewConfig = getConfig("general-purpose");

  assert.equal(agentConfig?.name, "Librarian");
  assert.equal(viewConfig.displayName, "Librarian");
  assert.equal(viewConfig.promptMode, "replace");
  assert.deepEqual(getToolsForType("general-purpose", process.cwd()).map((tool) => tool.name), ["read", "bash", "grep", "find", "ls"]);
});
