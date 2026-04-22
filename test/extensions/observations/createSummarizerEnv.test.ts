import assert from "node:assert/strict";
import test from "node:test";
import { createSummarizerEnv } from "../../../src/extensions/observations/summarizer/createSummarizerEnv.js";

test("createSummarizerEnv inherits the current process environment", () => {
  const env = createSummarizerEnv();

  assert.notEqual(env, process.env);
  assert.equal(env.PATH, process.env.PATH);
});
