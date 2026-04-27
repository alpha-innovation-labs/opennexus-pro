import assert from "node:assert/strict";
import test from "node:test";
import { buildBriefBlock } from "../../../src/extensions/sub-agents/runtime/executeSubagentRun.js";
import { buildSubagentPrompt } from "../../../src/extensions/sub-agents/runtime/buildSubagentPrompt.js";

/**
 * Verifies workflow context briefs are serialized into the prompt block passed to subagents.
 */
test("workflow brief injection formats the subagent context block", () => {
  const brief = buildBriefBlock("  Use the failing checkout flow as context.  ");
  const prompt = buildSubagentPrompt(brief, "Fix the test");

  assert.match(prompt, /# Context Brief/);
  assert.match(prompt, /Use the failing checkout flow as context\./);
  assert.match(prompt, /# Your Task\n\nFix the test/);
});
