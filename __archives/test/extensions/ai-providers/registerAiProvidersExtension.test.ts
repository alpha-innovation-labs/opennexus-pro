import assert from "node:assert/strict";
import test from "node:test";
import { AuthStorage } from "../../../node_modules/@earendil-works/pi-coding-agent/dist/core/auth-storage.js";
import { ModelRegistry } from "../../../node_modules/@earendil-works/pi-coding-agent/dist/core/model-registry.js";
import { createManualOAuthProvider } from "../../../packages/extension-core/src/ai-providers/oauth/createManualOAuthProvider.js";
import { getAdditionalOhMyPiProviderDefinitions } from "../../../packages/extension-core/src/ai-providers/model/getAdditionalOhMyPiProviderDefinitions.js";
import { getManualOhMyPiProviderDefinitions } from "../../../packages/extension-core/src/ai-providers/model/manualOhMyPiProviderDefinitions.js";
import { ohMyPiProviderDefinitions } from "../../../packages/extension-core/src/ai-providers/model/ohMyPiProviderDefinitions.js";
import { registerOhMyPiProvider } from "../../../packages/extension-core/src/ai-providers/register/registerOhMyPiProvider.js";

test("ai-providers includes Cursor from oh-my-pi but excludes it from manual placeholders", () => {
  const additionalProviderIds = getAdditionalOhMyPiProviderDefinitions().map((provider) => provider.id);
  const manualProviderIds = getManualOhMyPiProviderDefinitions().map((provider) => provider.id);

  assert.equal(ohMyPiProviderDefinitions.some((provider) => provider.id === "cursor"), true);
  assert.equal(additionalProviderIds.includes("cursor"), true);
  assert.equal(manualProviderIds.includes("cursor"), false);
  assert.equal(manualProviderIds.includes("anthropic"), false);
  assert.equal(manualProviderIds.includes("openai-codex"), false);
});

test("manual minimax coding plan provider registers bundled models under login provider id", () => {
  const registrations: Array<{ name: string; config: { baseUrl?: string; models?: Array<{ id: string; provider?: string }> } }> = [];
  const definition = ohMyPiProviderDefinitions.find((provider) => provider.id === "minimax-code");
  assert.ok(definition);

  registerOhMyPiProvider({
    registerProvider: (name: string, config: { baseUrl?: string; models?: Array<{ id: string; provider?: string }> }) => {
      registrations.push({ name, config });
    },
  } as never, definition);

  assert.equal(registrations[0]?.name, "minimax-code");
  assert.equal(registrations[0]?.config.baseUrl, "https://api.minimax.io/anthropic");
  assert.deepEqual(registrations[0]?.config.models?.map((model) => model.id), ["MiniMax-M2.7", "MiniMax-M2.7-highspeed"]);
});

test("manual minimax coding plan login makes minimax models available", () => {
  const authStorage = AuthStorage.inMemory({ "minimax-code": { type: "oauth", access: "minimax-token" } });
  const modelRegistry = ModelRegistry.inMemory(authStorage);
  const definition = ohMyPiProviderDefinitions.find((provider) => provider.id === "minimax-code");
  assert.ok(definition);

  registerOhMyPiProvider({ registerProvider: modelRegistry.registerProvider.bind(modelRegistry) } as never, definition);

  assert.deepEqual(
    modelRegistry.getAvailable().filter((model) => model.provider === "minimax-code").map((model) => model.id),
    ["MiniMax-M2.7", "MiniMax-M2.7-highspeed"],
  );
});

test("manual ai-provider OAuth login stores manual credentials", async () => {
  const provider = createManualOAuthProvider({
    id: "zenmux",
    name: "ZenMux",
    credentialLabel: "API key",
  });

  const credentials = await provider.login({
    onAuth() {},
    onPrompt: async () => "zenmux-token",
  });

  assert.equal(credentials.access, "zenmux-token");
  assert.equal(provider.getApiKey(credentials), "zenmux-token");
});
