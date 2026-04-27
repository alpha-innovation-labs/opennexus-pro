import assert from "node:assert/strict";
import test from "node:test";
import { createSummarizerEnv } from "../../../src/extensions/observations/summarizer/createSummarizerEnv.js";

/**
 * Verifies the summarizer child process receives an isolated copy of the current environment.
 */
test("createSummarizerEnv inherits custom runtime environment without mutating process env", () => {
  const previous = process.env.NEXUS_OBSERVATION_TEST_TOKEN;
  process.env.NEXUS_OBSERVATION_TEST_TOKEN = "token-123";

  try {
    const env = createSummarizerEnv();
    env.NEXUS_OBSERVATION_TEST_TOKEN = "changed";

    assert.notEqual(env, process.env);
    assert.equal(process.env.NEXUS_OBSERVATION_TEST_TOKEN, "token-123");
    assert.equal(createSummarizerEnv().NEXUS_OBSERVATION_TEST_TOKEN, "token-123");
  } finally {
    if (previous === undefined) delete process.env.NEXUS_OBSERVATION_TEST_TOKEN;
    else process.env.NEXUS_OBSERVATION_TEST_TOKEN = previous;
  }
});
