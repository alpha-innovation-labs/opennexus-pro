import assert from "node:assert/strict";
import test from "node:test";
import type { ExtensionAPI, ProviderConfig, ProviderModelConfig } from "@mariozechner/pi-coding-agent";
import { createCursorProviderWithoutFallbackApi } from "../../packages/extensions/src/ai-providers/register/createCursorProviderWithoutFallbackApi.js";
import { ensureStoredCursorModelsRegistered, resetStoredCursorModelLoaderForTests, setStoredCursorModelLoader } from "../../packages/extensions/src/ai-providers/register/cursorStoredModelLoader.js";

interface ProviderRegistration {
	name: string;
	config: ProviderConfig;
}

/**
 * Creates a minimal ExtensionAPI test double that records provider registrations.
 *
 * @returns The test API and collected provider registrations.
 */
function createProviderRegistrationApi(): { pi: ExtensionAPI; registrations: ProviderRegistration[] } {
	const registrations: ProviderRegistration[] = [];
	const pi = {
		registerProvider(name: string, config: ProviderConfig): void {
			registrations.push({ name, config });
		},
	} as ExtensionAPI;

	return { pi, registrations };
}

/**
 * Creates a complete provider model config for tests.
 *
 * @param id Model identifier.
 * @returns Provider model config using deterministic default metadata.
 */
function createProviderModel(id: string): ProviderModelConfig {
	return {
		id,
		name: id,
		api: "openai-completions",
		reasoning: false,
		input: ["text"],
		cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
		contextWindow: 128000,
		maxTokens: 16384,
	};
}

test("createCursorProviderWithoutFallbackApi removes only the first Cursor model list", () => {
	const { pi, registrations } = createProviderRegistrationApi();
	const wrapped = createCursorProviderWithoutFallbackApi(pi);
	const oauth = {
		name: "Cursor",
		login: async () => ({ access: "access", refresh: "refresh", expires: Date.now() + 60000 }),
		refreshToken: async () => ({ access: "access", refresh: "refresh", expires: Date.now() + 60000 }),
		getApiKey: () => "cursor-proxy",
	} satisfies ProviderConfig["oauth"];

	wrapped.registerProvider("cursor", {
		baseUrl: "http://127.0.0.1:1234/v1",
		api: "openai-completions",
		oauth,
		models: [createProviderModel("hardcoded-fallback")],
	});
	wrapped.registerProvider("cursor", {
		baseUrl: "http://127.0.0.1:1234/v1",
		api: "openai-completions",
		oauth,
		models: [createProviderModel("endpoint-model")],
	});

	assert.equal(registrations.length, 2);
	assert.equal(registrations[0]?.name, "cursor");
	assert.deepEqual(registrations[0]?.config.models, []);
	assert.equal(registrations[0]?.config.oauth?.name, oauth?.name);
	assert.equal(registrations[1]?.config.models?.[0]?.id, "endpoint-model");
});

test("createCursorProviderWithoutFallbackApi leaves non-Cursor providers unchanged", () => {
	const { pi, registrations } = createProviderRegistrationApi();
	const wrapped = createCursorProviderWithoutFallbackApi(pi);
	const model = createProviderModel("other-model");

	wrapped.registerProvider("other", { models: [model] });

	assert.equal(registrations[0]?.name, "other");
	assert.deepEqual(registrations[0]?.config.models, [model]);
});

test("ensureStoredCursorModelsRegistered runs the deferred Cursor loader once", async () => {
	resetStoredCursorModelLoaderForTests();
	let calls = 0;
	setStoredCursorModelLoader(async () => {
		calls += 1;
	});

	await ensureStoredCursorModelsRegistered();
	await ensureStoredCursorModelsRegistered();

	assert.equal(calls, 1);
	resetStoredCursorModelLoaderForTests();
});
