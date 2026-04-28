import assert from "node:assert/strict";
import test from "node:test";
import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { createLoginImportLeaves } from "../../../packages/extensions/src/neo-editor/features/menu/createLoginImportLeaves.js";
import { createLoginLeaves } from "../../../packages/extensions/src/neo-editor/features/menu/createLoginLeaves.js";
import { getSlashMenuItemIcon } from "../../../packages/extensions/src/neo-editor/features/menu/getSlashMenuItemIcon.js";

/**
 * Creates the smallest extension context needed by login leaves.
 *
 * @param configuredProviderIds Provider ids that already have auth.
 * @returns Extension context fixture.
 */
function createContext(configuredProviderIds: readonly string[] = []): ExtensionContext {
	const configured = new Set(configuredProviderIds);
	return {
		modelRegistry: {
			authStorage: {
				get: () => undefined,
				hasAuth: (providerId: string) => configured.has(providerId),
			},
		},
	} as unknown as ExtensionContext;
}

test("Nexus slash login menu shows import sources above visible providers", () => {
	const leaves = createLoginLeaves(createContext());

	assert.deepEqual(leaves.slice(0, 2).map((leaf) => [leaf.groupLabel, leaf.label, leaf.value]), [
		["Import", "Import from Pi", "import:pi"],
		["Import", "Import from OpenCode", "import:opencode"],
	]);
	assert.ok(leaves.slice(2).every((leaf) => /^Providers \(\d+\)$/u.test(leaf.groupLabel ?? "")));
	assert.ok(leaves.slice(2).some((leaf) => leaf.value === "anthropic"));
});

test("Nexus slash login import submenu helper still contains Pi and OpenCode imports", () => {
	const leaves = createLoginImportLeaves();

	assert.deepEqual(leaves.map((leaf) => [leaf.groupLabel, leaf.label, leaf.value]), [
		["Import", "Import from Pi", "import:pi"],
		["Import", "Import from OpenCode", "import:opencode"],
	]);
});

test("Nexus slash login provider list puts configured providers first with filled lozenge", () => {
	const leaves = createLoginLeaves(createContext(["anthropic"]));
	const providers = leaves.filter((leaf) => !leaf.value.startsWith("import:"));
	const anthropic = providers.find((leaf) => leaf.value === "anthropic");
	const unconfigured = providers.find((leaf) => leaf.value !== "anthropic");

	assert.equal(providers[0]?.value, "anthropic");
	assert.ok(anthropic);
	assert.ok(unconfigured);
	assert.equal(getSlashMenuItemIcon(anthropic, "login"), "◆");
	assert.equal(getSlashMenuItemIcon(unconfigured, "login"), "◇");
});
