import assert from "node:assert/strict";
import test from "node:test";
import { getWorkflowEngineerModePrompt } from "../../../packages/mini-apps/src/workflows/prompts/getWorkflowEngineerModePrompt.js";
import { buildAgentInstructionBlock } from "../../../packages/extensions/src/sub-agents/runtime/buildAgentInstructionBlock.js";

test("injects implementation mode without setup-only commands", () => {
  const prompt = getWorkflowEngineerModePrompt("implementation") ?? "";

  assert.match(prompt, /Implementation expert/);
  assert.match(prompt, /senior software engineer/);
  assert.match(prompt, /bd show <issue-id>/);
  assert.doesNotMatch(prompt, /git worktree add/);
  assert.doesNotMatch(prompt, /bd create/);
});

test("injects mode prompt only for Engineer", () => {
  const engineer = buildAgentInstructionBlock("Engineer", "e2e");
  const librarian = buildAgentInstructionBlock("Librarian", "e2e");

  assert.match(engineer, /Injected Subagent Mode/);
  assert.match(engineer, /E2E testing expert/);
  assert.doesNotMatch(librarian, /Injected Subagent Mode/);
});
