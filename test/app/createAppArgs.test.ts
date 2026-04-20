import assert from "node:assert/strict";
import test from "node:test";
import { createAppArgs } from "../../src/cli/createAppArgs.js";
import { baseSystemPrompt } from "../../src/cli/system-prompt/baseSystemPrompt.js";
import { getBundledThemesPath } from "../../src/themes/getBundledThemesPath.js";

test("createAppArgs prepends bundled themes, the base system prompt, and --no-extensions", () => {
  assert.deepEqual(createAppArgs(["--help"]), [
    "--theme",
    getBundledThemesPath(),
    "--no-extensions",
    "--append-system-prompt",
    baseSystemPrompt,
    "--help",
  ]);
});

test("createAppArgs avoids duplicating --no-extensions", () => {
  assert.deepEqual(createAppArgs(["--no-extensions", "--help"]), [
    "--theme",
    getBundledThemesPath(),
    "--append-system-prompt",
    baseSystemPrompt,
    "--no-extensions",
    "--help",
  ]);
});

test("createAppArgs avoids duplicating the bundled themes path", () => {
  assert.deepEqual(
    createAppArgs(["--theme", getBundledThemesPath(), "--no-extensions", "--help"]),
    ["--append-system-prompt", baseSystemPrompt, "--theme", getBundledThemesPath(), "--no-extensions", "--help"],
  );
});

test("createAppArgs avoids duplicating the bundled base system prompt", () => {
  assert.deepEqual(
    createAppArgs(["--append-system-prompt", baseSystemPrompt, "--no-extensions", "--help"]),
    ["--theme", getBundledThemesPath(), "--append-system-prompt", baseSystemPrompt, "--no-extensions", "--help"],
  );
});

test("getBundledThemesPath resolves the themes directory in source mode", () => {
  assert.match(getBundledThemesPath(), /\/src\/themes\/?$/);
});
