import assert from "node:assert/strict";
import test from "node:test";
import { AuthStorage } from "../../node_modules/@mariozechner/pi-coding-agent/dist/core/auth-storage.js";
import { SettingsManager } from "../../node_modules/@mariozechner/pi-coding-agent/dist/core/settings-manager.js";
import { pruneLoggedOutEnabledModels } from "../../packages/pi-platform/src/settings/pruneLoggedOutEnabledModels.js";

const originalAuthCreate = AuthStorage.create;
const originalSettingsCreate = SettingsManager.create;

test.afterEach(() => {
  AuthStorage.create = originalAuthCreate;
  SettingsManager.create = originalSettingsCreate;
});

test("pruneLoggedOutEnabledModels removes stale scopes for every logged-out provider", async () => {
  let savedModels: string[] | undefined = ["cursor/claude-4-sonnet", "anthropic/claude-sonnet-4-5", "openai/gpt-5"];
  AuthStorage.create = (() => ({ hasAuth: (provider: string) => provider === "openai" })) as unknown as typeof AuthStorage.create;
  SettingsManager.create = (() => ({
    getEnabledModels: () => savedModels,
    setEnabledModels: (patterns: string[] | undefined) => {
      savedModels = patterns;
    },
    writeQueue: Promise.resolve(),
  })) as unknown as typeof SettingsManager.create;

  await pruneLoggedOutEnabledModels(process.cwd());

  assert.deepEqual(savedModels, ["openai/gpt-5"]);
});

test("pruneLoggedOutEnabledModels keeps scopes for authenticated providers", async () => {
  let savedModels: string[] | undefined = ["cursor/claude-4-sonnet", "anthropic/claude-sonnet-4-5"];
  AuthStorage.create = (() => ({ hasAuth: () => true })) as unknown as typeof AuthStorage.create;
  SettingsManager.create = (() => ({
    getEnabledModels: () => savedModels,
    setEnabledModels: (patterns: string[] | undefined) => {
      savedModels = patterns;
    },
    writeQueue: Promise.resolve(),
  })) as unknown as typeof SettingsManager.create;

  await pruneLoggedOutEnabledModels(process.cwd());

  assert.deepEqual(savedModels, ["cursor/claude-4-sonnet", "anthropic/claude-sonnet-4-5"]);
});
