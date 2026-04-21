import assert from "node:assert/strict";
import test from "node:test";
import { createRunTitle } from "../../../src/extensions/sub-agents/runtime/createRunTitle.js";

test("createRunTitle prefixes subagent runs and prefers the parent prompt", () => {
  assert.equal(
    createRunTitle("Scan package.json", "Review package.json setup"),
    "[sub] Review package.json setup",
  );
});
