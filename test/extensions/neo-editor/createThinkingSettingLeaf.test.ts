import assert from "node:assert/strict";
import test from "node:test";
import { createThinkingSettingLeaf } from "../../../packages/extensions/src/slash-menu/createThinkingSettingLeaf.js";
import type { Api, Model } from "@mariozechner/pi-ai";

const baseModel: Model<Api> = {
  id: "test-model",
  name: "Test Model",
  api: "openai-responses",
  provider: "test-provider",
  baseUrl: "https://example.test",
  reasoning: true,
  input: ["text"],
  cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
  contextWindow: 1,
  maxTokens: 1,
};

test("thinking setting uses off only when model is unavailable", () => {
  const leaf = createThinkingSettingLeaf("off", undefined);

  assert.deepEqual(leaf.options, ["off"]);
});

test("thinking setting includes xhigh only when model metadata supports it", () => {
  const leaf = createThinkingSettingLeaf("medium", { ...baseModel, thinkingLevelMap: { xhigh: "xhigh" } });

  assert.deepEqual(leaf.options, ["off", "minimal", "low", "medium", "high", "xhigh"]);
});

test("thinking setting hides xhigh when model metadata does not support it", () => {
  const leaf = createThinkingSettingLeaf("medium", baseModel);

  assert.deepEqual(leaf.options, ["off", "minimal", "low", "medium", "high"]);
});

test("thinking setting respects unsupported levels from thinking level map", () => {
  const leaf = createThinkingSettingLeaf("medium", { ...baseModel, thinkingLevelMap: { minimal: null, xhigh: null } });

  assert.deepEqual(leaf.options, ["off", "low", "medium", "high"]);
});
