import assert from "node:assert/strict";
import test from "node:test";
import { getWorkflowEngineerPrompt } from "../../../src/extensions/workflows/prompts/getWorkflowEngineerPrompt.js";
import { getWorkflowLibrarianPrompt } from "../../../src/extensions/workflows/prompts/getWorkflowLibrarianPrompt.js";

test("engineer prompt declares mode-driven instruction injection", () => {
  const prompt = getWorkflowEngineerPrompt();

  assert.match(prompt, /Supported modes are/);
  assert.match(prompt, /follow only the injected mode instructions/);
  assert.match(prompt, /Do not assume commands from another mode/);
});

test("librarian prompt includes context brief contract", () => {
  const prompt = getWorkflowLibrarianPrompt();

  assert.match(prompt, /Context brief schema/);
  assert.match(prompt, /\.\/context\/\.rules/);
  assert.match(prompt, /E2E rule/);
  assert.match(prompt, /Exact next prompt for the Engineer/);
});
