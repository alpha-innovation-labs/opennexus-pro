import assert from "node:assert/strict";
import test from "node:test";
import { filterLoggedInEnabledModelPatterns } from "../../packages/pi-platform/src/settings/filterLoggedInEnabledModelPatterns.js";
import { getProviderFromEnabledModelPattern } from "../../packages/pi-platform/src/settings/getProviderFromEnabledModelPattern.js";

test("getProviderFromEnabledModelPattern reads provider namespace only from qualified patterns", () => {
  assert.equal(getProviderFromEnabledModelPattern("anthropic/claude-sonnet-4-5:high"), "anthropic");
  assert.equal(getProviderFromEnabledModelPattern("claude-sonnet-4-5"), undefined);
});

test("filterLoggedInEnabledModelPatterns removes logged-out providers for all providers", () => {
  const patterns = ["cursor/claude-4-sonnet", "anthropic/claude-sonnet-4-5", "openai/gpt-5", "sonnet"];

  const result = filterLoggedInEnabledModelPatterns(patterns, {
    hasAuth: (provider) => provider === "openai",
  });

  assert.deepEqual(result, ["openai/gpt-5", "sonnet"]);
});

test("filterLoggedInEnabledModelPatterns clears explicit scope when no provider remains", () => {
  const result = filterLoggedInEnabledModelPatterns(["cursor/claude-4-sonnet", "anthropic/claude-sonnet-4-5"], {
    hasAuth: () => false,
  });

  assert.equal(result, undefined);
});
