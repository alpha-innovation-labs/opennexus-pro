import assert from "node:assert/strict";
import test from "node:test";
import { rewriteSubagentPrompt } from "../../../src/extensions/sub-agents/vendor/subagent-prompt/rewriteSubagentPrompt.js";

const prompt = [
  "Base prompt",
  "",
  "# Project Context",
  "",
  "Project-specific instructions and guidelines:",
  "",
  "Project line",
  "",
  "The following skills provide specialized instructions for specific tasks.",
  "<skill>Skill line</skill>",
  "",
  "Current date: 2026-04-20",
].join("\n");

test("rewriteSubagentPrompt strips project context and inherited skills when disabled", () => {
  const rewritten = rewriteSubagentPrompt(prompt, {
    inheritProjectContext: false,
    inheritSkills: false,
  });

  assert.equal(rewritten.includes("Project-specific instructions"), false);
  assert.equal(rewritten.includes("<skill>Skill line</skill>"), false);
  assert.equal(rewritten.includes("Current date: 2026-04-20"), true);
});

test("rewriteSubagentPrompt preserves prompt sections when inheritance stays enabled", () => {
  const rewritten = rewriteSubagentPrompt(prompt, {
    inheritProjectContext: true,
    inheritSkills: true,
  });

  assert.equal(rewritten, prompt);
});
