import assert from "node:assert/strict";
import test from "node:test";
import { createTsxTestArgs } from "../../../scripts/testing/process/createTsxTestArgs.mjs";

test("createTsxTestArgs passes the configured concurrency to the Node test runner", () => {
  assert.deepEqual(createTsxTestArgs(["test/app/alpha.test.ts"], 4), [
    "--test",
    "--test-concurrency=4",
    "test/app/alpha.test.ts",
  ]);
});
