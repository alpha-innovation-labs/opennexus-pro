import assert from "node:assert/strict";
import test from "node:test";
import { summarizeArgs } from "../../../packages/extensions/src/tron/compact-tool-lines/summarizeArgs.js";

test("summarizeArgs extracts todo subject and description without a tool-specific branch", () => {
  const summary = summarizeArgs("todo", {
    action: "create",
    subject: "Create prompts extension",
    description: "Add bundled prompts extension with modal support",
  });

  assert.equal(summary.main, "Create prompts extension · Add bundled prompts extension with modal support");
  assert.equal(summary.options, "action=create");
});

test("summarizeArgs extracts web_search queries through generic field priority", () => {
  const summary = summarizeArgs("web_search", {
    query: "Kaiko crypto market data pricing",
    provider: "exa",
    limit: 8,
  });

  assert.equal(summary.main, "Kaiko crypto market data pricing");
  assert.equal(summary.options, "provider=exa limit=8");
});

test("summarizeArgs extracts ask_user_question question through generic field priority", () => {
  const summary = summarizeArgs("ask_user_question", {
    question: "What would you like me to help you with next?",
    type: "single-select",
  });

  assert.equal(summary.main, "What would you like me to help you with next?");
  assert.equal(summary.options, "type=single-select");
});

test("summarizeArgs handles future unknown tools with common fields", () => {
  const summary = summarizeArgs("future_custom_tool", {
    action: "inspect",
    title: "Investigate auth flow",
    status: "pending",
  });

  assert.equal(summary.main, "Investigate auth flow");
  assert.equal(summary.options, "action=inspect status=pending");
});
