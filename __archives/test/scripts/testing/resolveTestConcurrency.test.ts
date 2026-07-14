import assert from "node:assert/strict";
import test from "node:test";
import { resolveTestConcurrency } from "../../../scripts/testing/process/resolveTestConcurrency.mjs";

test("resolveTestConcurrency defaults to four parallel test files", () => {
  assert.equal(resolveTestConcurrency({}), 4);
});

test("resolveTestConcurrency uses a positive integer override", () => {
  assert.equal(resolveTestConcurrency({ NEXUS_TEST_CONCURRENCY: "8" }), 8);
});

test("resolveTestConcurrency rejects non-integer overrides", () => {
  assert.throws(
    () => {
      resolveTestConcurrency({ NEXUS_TEST_CONCURRENCY: "2.5" });
    },
    /positive integer/,
  );
});

test("resolveTestConcurrency rejects zero overrides", () => {
  assert.throws(
    () => {
      resolveTestConcurrency({ NEXUS_TEST_CONCURRENCY: "0" });
    },
    /positive integer/,
  );
});
