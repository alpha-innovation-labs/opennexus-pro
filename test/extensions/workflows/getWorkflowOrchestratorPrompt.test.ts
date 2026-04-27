import assert from "node:assert/strict";
import test from "node:test";
import { getWorkflowOrchestratorPrompt } from "../../../packages/extensions/src/workflows/logic/getWorkflowOrchestratorPrompt.js";

test("builds a continuous workflow prompt with steering instructions", () => {
  const prompt = getWorkflowOrchestratorPrompt("Fix the background session modal");

  assert.match(prompt, /Fix the background session modal/);
  assert.match(prompt, /steer_subagent/);
  assert.match(prompt, /Prefer steering existing active agents/);
  assert.match(prompt, /Workflow Librarian/);
  assert.match(prompt, /Workflow Engineer/);
});
