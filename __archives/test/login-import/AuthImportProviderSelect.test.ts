import assert from "node:assert/strict";
import test from "node:test";
import { AuthImportProviderSelect } from "../../packages/pi-platform/src/login-import/ui/AuthImportProviderSelect.js";
import type { AuthImportCandidate } from "../../packages/pi-platform/src/login-import/model/AuthImportCandidate.js";

const candidates: AuthImportCandidate[] = [
	{
		providerId: "anthropic",
		displayName: "Anthropic",
		credential: { type: "api_key", key: "a" },
		sourceProviderId: "anthropic",
	},
	{
		providerId: "openai-codex",
		displayName: "OpenAI Codex",
		credential: { type: "api_key", key: "b" },
		sourceProviderId: "openai",
	},
];

test("auth import provider selector toggles with space and confirms with enter", () => {
	let selected: AuthImportCandidate[] = [];
	const selector = new AuthImportProviderSelect(candidates, (nextSelected) => {
		selected = nextSelected;
	}, () => {});

	selector.handleInput(" ");
	selector.handleInput("j");
	selector.handleInput(" ");
	selector.handleInput("\r");

	assert.deepEqual(selected.map((candidate) => candidate.providerId), ["anthropic", "openai-codex"]);
});

test("auth import provider selector cancels without selecting", () => {
	let cancelled = false;
	const selector = new AuthImportProviderSelect(candidates, () => {}, () => {
		cancelled = true;
	});

	selector.handleInput("\x1b");

	assert.equal(cancelled, true);
});
