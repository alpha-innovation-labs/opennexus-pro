import assert from "node:assert/strict";
import test from "node:test";
import {
  isSubagentRunnerMode,
  SUBAGENT_RUNNER_FLAG,
} from "../../../src/runtime/subagent-runner/isSubagentRunnerMode.js";

test("isSubagentRunnerMode detects the internal runner flag", () => {
  assert.equal(isSubagentRunnerMode([SUBAGENT_RUNNER_FLAG, "config.json"]), true);
  assert.equal(isSubagentRunnerMode(["--help"]), false);
});
