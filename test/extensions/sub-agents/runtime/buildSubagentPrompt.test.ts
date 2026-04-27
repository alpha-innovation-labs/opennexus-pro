import test from "node:test";
import assert from "node:assert/strict";
import { buildSubagentPrompt } from "../../../../packages/extensions/src/sub-agents/runtime/buildSubagentPrompt.js";

/**
 * Verifies prompt composition with and without inherited context.
 */
test("buildSubagentPrompt prepends context and task heading", () => {
  const result = buildSubagentPrompt("context block", "do work");
  assert.equal(result, "context block\n\n---\n\n# Your Task\n\ndo work");
});

test("buildSubagentPrompt returns the raw prompt when context is empty", () => {
  assert.equal(buildSubagentPrompt("", "do work"), "do work");
});
