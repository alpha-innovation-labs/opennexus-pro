import assert from "node:assert/strict";
import test from "node:test";
import { appendNoExtensionsArg } from "../../../src/cli/extensions/appendNoExtensionsArg.js";
import { hasNoExtensionsFlag } from "../../../src/cli/extensions/hasNoExtensionsFlag.js";

test("hasNoExtensionsFlag detects the long flag", () => {
  assert.equal(hasNoExtensionsFlag(["--no-extensions", "--help"]), true);
});

test("hasNoExtensionsFlag detects the short flag", () => {
  assert.equal(hasNoExtensionsFlag(["-ne", "--help"]), true);
});

test("appendNoExtensionsArg prepends the canonical flag when missing", () => {
  assert.deepEqual(appendNoExtensionsArg(["--help"]), ["--no-extensions", "--help"]);
});

test("appendNoExtensionsArg preserves the long flag", () => {
  assert.deepEqual(appendNoExtensionsArg(["--no-extensions", "--help"]), ["--no-extensions", "--help"]);
});

test("appendNoExtensionsArg preserves the short flag", () => {
  assert.deepEqual(appendNoExtensionsArg(["-ne", "--help"]), ["-ne", "--help"]);
});
