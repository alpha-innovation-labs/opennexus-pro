import assert from "node:assert/strict";
import test from "node:test";
import { createAppArgs } from "../../src/cli/createAppArgs.js";
import { getBundledThemesPath } from "../../src/themes/getBundledThemesPath.js";

test("createAppArgs prepends bundled themes and --no-extensions", () => {
  assert.deepEqual(createAppArgs(["--help"]), ["--theme", getBundledThemesPath(), "--no-extensions", "--help"]);
});

test("createAppArgs avoids duplicating --no-extensions", () => {
  assert.deepEqual(createAppArgs(["--no-extensions", "--help"]), ["--theme", getBundledThemesPath(), "--no-extensions", "--help"]);
});

test("createAppArgs avoids duplicating the bundled themes path", () => {
  assert.deepEqual(
    createAppArgs(["--theme", getBundledThemesPath(), "--no-extensions", "--help"]),
    ["--theme", getBundledThemesPath(), "--no-extensions", "--help"],
  );
});
