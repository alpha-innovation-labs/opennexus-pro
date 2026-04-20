import assert from "node:assert/strict";
import test from "node:test";
import { addBaseSystemPromptArg } from "../../../src/cli/system-prompt/addBaseSystemPromptArg.js";
import { baseSystemPrompt } from "../../../src/prompts/base-system-prompt/baseSystemPrompt.js";

test("addBaseSystemPromptArg prepends the bundled append argument", () => {
  assert.deepEqual(addBaseSystemPromptArg(["--help"]), ["--append-system-prompt", baseSystemPrompt, "--help"]);
});

test("addBaseSystemPromptArg avoids duplicating the bundled append argument", () => {
  assert.deepEqual(addBaseSystemPromptArg(["--append-system-prompt", baseSystemPrompt, "--help"]), ["--append-system-prompt", baseSystemPrompt, "--help"]);
});
