import assert from "node:assert/strict";
import test from "node:test";
import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { createLogoutProviderLeaves } from "../../../packages/extensions/src/neo-editor/features/menu/createLogoutProviderLeaves.js";

/**
 * Creates an extension context with stored auth credentials.
 *
 * @returns Extension context fixture.
 */
function createContext(): ExtensionContext {
	const credentials = new Map([
		["minimax", { type: "api_key", key: "key" }],
		["openai-codex", { type: "oauth", access: "a", refresh: "r", expires: Date.now() + 1000 }],
	]);
	return {
		modelRegistry: {
			authStorage: {
				list: () => [...credentials.keys()],
				get: (providerId: string) => credentials.get(providerId),
			},
		},
	} as unknown as ExtensionContext;
}

test("logout provider leaves include API-key and OAuth credentials", () => {
	const leaves = createLogoutProviderLeaves(createContext());

	assert.deepEqual(leaves.map((leaf) => leaf.value).sort(), ["minimax", "openai-codex"]);
	assert.equal(leaves.find((leaf) => leaf.value === "minimax")?.description, "API key");
});
