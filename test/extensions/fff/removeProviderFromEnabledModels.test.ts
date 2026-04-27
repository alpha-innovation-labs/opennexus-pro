import assert from "node:assert/strict";
import test from "node:test";
import { removeProviderFromEnabledModels } from "../../../packages/extensions/src/neo-editor/features/menu/model/removeProviderFromEnabledModels.js";

/**
 * Creates fake enabled-model settings for cleanup tests.
 */
function createSettings(enabledModels: string[] | undefined) {
  let savedModels: string[] | undefined = enabledModels;
  return {
    settings: {
      getEnabledModels: () => savedModels,
      setEnabledModels: (patterns: string[] | undefined) => {
        savedModels = patterns;
      },
    },
    read: () => savedModels,
  };
}

test("removeProviderFromEnabledModels removes only provider-qualified patterns", () => {
  const fixture = createSettings(["openai/gpt-5", "cursor/claude-4-sonnet", "cursor/*:high", "claude-4-sonnet"]);

  const result = removeProviderFromEnabledModels(fixture.settings, "cursor");

  assert.deepEqual(result, ["openai/gpt-5", "claude-4-sonnet"]);
  assert.deepEqual(fixture.read(), ["openai/gpt-5", "claude-4-sonnet"]);
});

test("removeProviderFromEnabledModels clears scoped settings when no models remain", () => {
  const fixture = createSettings(["cursor/claude-4-sonnet"]);

  const result = removeProviderFromEnabledModels(fixture.settings, "cursor");

  assert.equal(result, undefined);
  assert.equal(fixture.read(), undefined);
});
