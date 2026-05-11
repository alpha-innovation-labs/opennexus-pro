import assert from "node:assert/strict";
import test from "node:test";
import { createManagedExtensionRows } from "../../../packages/extensions/src/extension-manager/model/createManagedExtensionRows.js";
import { ExtensionManagerModal } from "../../../packages/extensions/src/extension-manager/ui/ExtensionManagerModal.js";
import type { ManagedExtensionRow } from "../../../packages/extensions/src/extension-manager/model/types.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

const rows: ManagedExtensionRow[] = [
	{ id: "core-alpha", kind: "core", status: "enabled", features: ["core feature"] },
	{ id: "third-party-beta", kind: "third-party", status: "disabled", features: [] },
];

test("/extensions rows keep core and third-party groups contiguous", () => {
	const managedRows = createManagedExtensionRows(
		{
			extensions: {
				"alpha-core": { enabled: true, features: [] },
				"zeta-core": { enabled: true, features: [] },
			},
		},
		{ extensions: { "middle-user": { enabled: true } } },
		[{ source: "npm:lazy-pi", scope: "user", filtered: false }],
	);

	assert.deepEqual(managedRows.map((row) => row.kind), ["core", "core", "third-party", "third-party"]);
	assert.deepEqual(managedRows.map((row) => row.id), ["alpha-core", "zeta-core", "lazy-pi", "middle-user"]);
	assert.equal(managedRows[2]?.rowType, "package");
});

test("/extensions modal renders installed extension rows grouped by Core and Third-party", async () => {
	const viewport = await renderComponentInVirtualTerminal(
		() => new ExtensionManagerModal(createTestTheme(), rows, () => {}),
		140,
		30,
	);
	const output = viewport.join("\n");

	assert.match(output, /Extensions/u);
	assert.match(output, /● All \| ○ Core \| ○ Third-party/u);
	assert.match(output, /Core/u);
	assert.match(output, /Third-party/u);
	assert.match(output, /core-alpha\s+› enabled/u);
	assert.match(output, /third-party-beta\s+› disabled/u);
	assert.doesNotMatch(output, /enabled\s+core/u);
});

test("/extensions modal switches between core and third-party tabs", () => {
	const modal = new ExtensionManagerModal(createTestTheme(), rows, () => {});

	modal.handleInput("\t");
	const coreOutput = modal.render(140).join("\n");
	modal.handleInput("\t");
	const thirdPartyOutput = modal.render(140).join("\n");

	assert.match(coreOutput, /○ All \| ● Core \| ○ Third-party/u);
	assert.match(coreOutput, /core-alpha/u);
	assert.doesNotMatch(coreOutput, /third-party-beta/u);
	assert.match(thirdPartyOutput, /○ All \| ○ Core \| ● Third-party/u);
	assert.match(thirdPartyOutput, /third-party-beta/u);
	assert.doesNotMatch(thirdPartyOutput, /core-alpha/u);
});

test("/extensions modal toggles selected extension enablement", () => {
	const updates: Array<{ extensionId: string; enabled: boolean }> = [];
	const modal = new ExtensionManagerModal(createTestTheme(), rows, () => {}, (extensionId, enabled) => {
		updates.push({ extensionId, enabled });
		return rows.map((row) => (row.id === extensionId ? { ...row, status: enabled ? "enabled" : "disabled" } : row));
	});

	modal.handleInput("\r");
	modal.handleInput("\x1b[B");
	modal.handleInput(" ");

	assert.deepEqual(updates, [
		{ extensionId: "core-alpha", enabled: false },
		{ extensionId: "third-party-beta", enabled: true },
	]);
});

test("/extensions third-party tab searches and installs npm package rows", async () => {
	let installedSource = "";
	const modal = new ExtensionManagerModal(createTestTheme(), rows, () => {}, {
		onInstallPackage: async (source) => {
			installedSource = source;
			return [...rows, { id: "lazy-pi", kind: "third-party", status: "enabled", features: [source], rowType: "package", source }];
		},
		onSearchPackages: async () => [{ id: "lazy-pi", kind: "third-party", status: "available", features: ["Package manager"], rowType: "search", source: "npm:lazy-pi" }],
	});

	modal.handleInput("\t");
	modal.handleInput("\t");
	modal.handleInput("/");
	modal.handleInput("l");
	await new Promise((resolve) => setTimeout(resolve, 0));
	const searchOutput = modal.render(140).join("\n");
	assert.match(searchOutput, /lazy-pi\s+› available/u);
	modal.handleInput("\r");
	await new Promise((resolve) => setTimeout(resolve, 0));

	assert.equal(installedSource, "npm:lazy-pi");
});

test("/extensions pressing d uninstalls selected third-party extension id", async () => {
	const removedSources: string[] = [];
	const modal = new ExtensionManagerModal(createTestTheme(), rows, () => {}, {
		onRemovePackage: async (source) => {
			removedSources.push(source);
			return rows.filter((row) => row.id !== source);
		},
	});

	modal.handleInput("\x1b[B");
	modal.handleInput("d");
	await new Promise((resolve) => setTimeout(resolve, 0));

	assert.deepEqual(removedSources, ["third-party-beta"]);
});

test("/extensions third-party search only captures text after slash", async () => {
	const queries: string[] = [];
	const modal = new ExtensionManagerModal(createTestTheme(), rows, () => {}, {
		onSearchPackages: async (query) => {
			queries.push(query);
			return [{ id: "pi-duck", kind: "third-party", status: "available", features: [query], rowType: "search", source: "npm:pi-duck" }];
		},
	});

	modal.handleInput("\t");
	modal.handleInput("\t");
	modal.handleInput("d");
	modal.handleInput("u");
	await new Promise((resolve) => setTimeout(resolve, 0));
	assert.deepEqual(queries, []);

	modal.handleInput("/");
	modal.handleInput("d");
	modal.handleInput("u");
	await new Promise((resolve) => setTimeout(resolve, 0));
	assert.equal(queries.at(-1), "du");
	assert.match(modal.render(140).join("\n"), /pi-duck\s+› available/u);
});
