import assert from "node:assert/strict";
import test from "node:test";
import { AuthStorage } from "@earendil-works/pi-coding-agent";
import { collectAuthImportCandidates } from "../../packages/pi-platform/src/login-import/collect/collectAuthImportCandidates.js";
import type { LoginImportModelRegistry } from "../../packages/pi-platform/src/login-import/model/LoginImportRegistry.js";

/**
 * Creates a model registry fixture for auth import tests.
 *
 * @param authStorage Storage fixture.
 * @returns Minimal model registry fixture.
 */
function createRegistry(authStorage = AuthStorage.inMemory()): LoginImportModelRegistry {
	return {
		authStorage,
		getAll: () => [
			{ provider: "openai" },
			{ provider: "openai-codex" },
			{ provider: "minimax-code" },
			{ provider: "anthropic" },
		],
		refresh: () => {},
	};
}

test("Pi auth import candidates skip providers already configured in Nexus", () => {
	const authStorage = AuthStorage.inMemory({ anthropic: { type: "api_key", key: "existing" } });
	const candidates = collectAuthImportCandidates(
		"pi",
		{
			anthropic: { type: "api_key", key: "from-pi" },
			"openai-codex": { type: "oauth", access: "token", refresh: "refresh", expires: Date.now() + 1000 },
			unknown: { type: "api_key", key: "ignored" },
		},
		createRegistry(authStorage),
	);

	assert.deepEqual(
		candidates.map((candidate) => candidate.providerId),
		["openai-codex"],
	);
});

test("OpenCode auth import candidates map provider ids to Nexus providers", () => {
	const candidates = collectAuthImportCandidates(
		"opencode",
		{
			openai: { type: "oauth", access: "token", refresh: "refresh", expires: Date.now() + 1000 },
			"minimax-coding-plan": { type: "api", key: "minimax-key" },
		},
		createRegistry(),
	);

	assert.deepEqual(
		candidates.map((candidate) => [candidate.sourceProviderId, candidate.providerId, candidate.credential.type]),
		[
			["openai", "openai-codex", "oauth"],
			["minimax-coding-plan", "minimax-code", "api_key"],
		],
	);
});
