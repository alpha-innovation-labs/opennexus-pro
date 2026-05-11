import assert from "node:assert/strict";
import test from "node:test";
import { ensureEnabledModelIncludesSelection } from "../../../packages/extension-core/src/slash-menu/model/ensureEnabledModelIncludesSelection.js";

test("ensureEnabledModelIncludesSelection leaves all-model scope unchanged", () => {
  assert.equal(ensureEnabledModelIncludesSelection(undefined, "openai-codex/gpt-5.5"), undefined);
});

test("ensureEnabledModelIncludesSelection appends selected model missing from scoped list", () => {
  assert.deepEqual(
    ensureEnabledModelIncludesSelection(["openai-codex/gpt-5.4"], "openai-codex/gpt-5.5"),
    ["openai-codex/gpt-5.4", "openai-codex/gpt-5.5"],
  );
});

test("ensureEnabledModelIncludesSelection preserves scoped list when selected model exists", () => {
  const enabled = ["openai-codex/gpt-5.4", "openai-codex/gpt-5.5"];

  assert.equal(ensureEnabledModelIncludesSelection(enabled, "openai-codex/gpt-5.5"), enabled);
});
