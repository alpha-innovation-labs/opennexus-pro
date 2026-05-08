import assert from "node:assert/strict";
import test from "node:test";
import type { AuthImportCandidate } from "../../../packages/pi-platform/src/login-import/model/AuthImportCandidate.js";
import { createAuthImportCandidateLeaves } from "../../../packages/extensions/src/slash-menu/createAuthImportCandidateLeaves.js";
import { getSlashMenuItemIcon } from "../../../packages/extensions/src/slash-menu/getSlashMenuItemIcon.js";

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

test("auth import candidate leaves render as same slash modal selectable rows", () => {
	const leaves = createAuthImportCandidateLeaves(candidates, new Set(["openai-codex"]));

	assert.deepEqual(leaves.map((leaf) => [leaf.groupLabel, leaf.label, leaf.value]), [
		["Providers", "Anthropic", "anthropic"],
		["Providers", "OpenAI Codex", "openai-codex"],
	]);
	assert.equal(getSlashMenuItemIcon(leaves[0], "login-import-candidates"), "○");
	assert.equal(getSlashMenuItemIcon(leaves[1], "login-import-candidates"), "●");
});
