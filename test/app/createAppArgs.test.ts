import assert from "node:assert/strict";
import test from "node:test";
import { getBundledCommandsPath } from "../../packages/assets/src/commands/getBundledCommandsPath.js";
import { createAppArgs } from "../../apps/tui/src/cli/createAppArgs.js";
import { baseSystemPrompt } from "../../packages/assets/src/prompts/base-system-prompt/baseSystemPrompt.js";
import { getBundledThemesPath } from "../../packages/assets/src/themes/getBundledThemesPath.js";

test("createAppArgs prepends bundled themes, bundled commands, and the base system prompt", () => {
  assert.deepEqual(createAppArgs(["--help"]), [
    "--theme",
    getBundledThemesPath(),
    "--prompt-template",
    getBundledCommandsPath(),
    "--append-system-prompt",
    baseSystemPrompt,
    "--help",
  ]);
});

test("createAppArgs preserves an explicit --no-extensions opt-out", () => {
  assert.deepEqual(createAppArgs(["--no-extensions", "--help"]), [
    "--theme",
    getBundledThemesPath(),
    "--prompt-template",
    getBundledCommandsPath(),
    "--append-system-prompt",
    baseSystemPrompt,
    "--no-extensions",
    "--help",
  ]);
});

test("createAppArgs preserves the short no-extensions opt-out", () => {
  assert.deepEqual(createAppArgs(["-ne", "--help"]), [
    "--theme",
    getBundledThemesPath(),
    "--prompt-template",
    getBundledCommandsPath(),
    "--append-system-prompt",
    baseSystemPrompt,
    "-ne",
    "--help",
  ]);
});

test("createAppArgs avoids duplicating the bundled themes path", () => {
  assert.deepEqual(
    createAppArgs(["--theme", getBundledThemesPath(), "--no-extensions", "--help"]),
    [
      "--prompt-template",
      getBundledCommandsPath(),
      "--append-system-prompt",
      baseSystemPrompt,
      "--theme",
      getBundledThemesPath(),
      "--no-extensions",
      "--help",
    ],
  );
});

test("createAppArgs avoids duplicating the bundled prompt-template path", () => {
  assert.deepEqual(
    createAppArgs(["--prompt-template", getBundledCommandsPath(), "--no-extensions", "--help"]),
    [
      "--theme",
      getBundledThemesPath(),
      "--append-system-prompt",
      baseSystemPrompt,
      "--prompt-template",
      getBundledCommandsPath(),
      "--no-extensions",
      "--help",
    ],
  );
});

test("createAppArgs avoids duplicating the bundled base system prompt", () => {
  assert.deepEqual(
    createAppArgs(["--append-system-prompt", baseSystemPrompt, "--no-extensions", "--help"]),
    [
      "--theme",
      getBundledThemesPath(),
      "--prompt-template",
      getBundledCommandsPath(),
      "--append-system-prompt",
      baseSystemPrompt,
      "--no-extensions",
      "--help",
    ],
  );
});

test("getBundledThemesPath resolves the themes directory in source mode", () => {
  assert.match(getBundledThemesPath(), /\/src\/themes\/?$/);
});

test("getBundledCommandsPath resolves the commands directory in source mode", () => {
  assert.match(getBundledCommandsPath(), /\/src\/commands\/?$/);
});
