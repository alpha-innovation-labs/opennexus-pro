import assert from "node:assert/strict";
import test from "node:test";
import { createAppArgs } from "../../src/cli/createAppArgs.js";

test("createAppArgs prepends --no-extensions", () => {
  assert.deepEqual(createAppArgs(["--help"]), ["--no-extensions", "--help"]);
});

test("createAppArgs avoids duplicating --no-extensions", () => {
  assert.deepEqual(createAppArgs(["--no-extensions", "--help"]), ["--no-extensions", "--help"]);
});
