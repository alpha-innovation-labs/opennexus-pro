import assert from "node:assert/strict";
import test from "node:test";
import { createThirdPartyManagedExtensionRows } from "../../../packages/extension-core/src/pi-packages/model/createThirdPartyManagedExtensionRows.js";
import { registerPiPackagesExtension } from "../../../packages/extension-core/src/pi-packages/registerPiPackagesExtension.js";
import { PiPackagesModal } from "../../../packages/extension-core/src/pi-packages/ui/PiPackagesModal.js";
import type { ManagedExtensionRow } from "../../../packages/extension-core/src/pi-packages/model/types.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

const rows: ManagedExtensionRow[] = [
	{ id: "package-alpha", kind: "third-party", status: "enabled", features: ["npm:package-alpha"], rowType: "package", source: "npm:package-alpha" },
	{ id: "third-party-beta", kind: "third-party", status: "disabled", features: [] },
];

test("/pi-packages registers the Pi packages slash command only", () => {
	const commands: string[] = [];
	registerPiPackagesExtension({ registerCommand: (name: string) => commands.push(name) } as never);

	assert.deepEqual(commands, ["pi-packages"]);
});

test("/pi-packages rows only include configured third-party packages", () => {
	const managedRows = createThirdPartyManagedExtensionRows(
		{ extensions: { annotate: { enabled: true }, workspace: { enabled: false }, "lazy-pi": { enabled: false } } },
		[{ source: "npm:lazy-pi", scope: "user", filtered: false }],
	);

	assert.deepEqual(managedRows.map((row) => row.kind), ["third-party"]);
	assert.deepEqual(managedRows.map((row) => row.id), ["lazy-pi"]);
	assert.equal(managedRows[0]?.rowType, "package");
	assert.equal(managedRows[0]?.status, "disabled");
});

test("/pi-packages modal renders third-party package rows", async () => {
	const viewport = await renderComponentInVirtualTerminal(
		() => new PiPackagesModal(createTestTheme(), rows, () => {}),
		140,
		30,
	);
	const output = viewport.join("\n");

	assert.match(output, /Pi Packages/u);
	assert.match(output, /○ All \| ● Third-party/u);
	assert.match(output, /Third-party/u);
	assert.doesNotMatch(output, /Core/u);
	assert.match(output, /package-alpha\s+› enabled/u);
	assert.match(output, /third-party-beta\s+› disabled/u);
});

test("/pi-packages modal switches between third-party and all tabs", () => {
	const modal = new PiPackagesModal(createTestTheme(), rows, () => {});

	const thirdPartyOutput = modal.render(140).join("\n");
	modal.handleInput("\t");
	const allOutput = modal.render(140).join("\n");

	assert.match(thirdPartyOutput, /○ All \| ● Third-party/u);
	assert.match(thirdPartyOutput, /third-party-beta/u);
	assert.match(allOutput, /● All \| ○ Third-party/u);
	assert.match(allOutput, /package-alpha/u);
});

test("/pi-packages modal toggles selected extension enablement", () => {
	const updates: Array<{ extensionId: string; enabled: boolean }> = [];
	const modal = new PiPackagesModal(createTestTheme(), rows, () => {}, (extensionId, enabled) => {
		updates.push({ extensionId, enabled });
		return rows.map((row) => (row.id === extensionId ? { ...row, status: enabled ? "enabled" : "disabled" } : row));
	});

	modal.handleInput("\r");
	modal.handleInput("\x1b[B");
	modal.handleInput(" ");

	assert.deepEqual(updates, [
		{ extensionId: "package-alpha", enabled: false },
		{ extensionId: "third-party-beta", enabled: true },
	]);
});

test("/pi-packages third-party tab searches and installs npm package rows", async () => {
	let installedSource = "";
	const modal = new PiPackagesModal(createTestTheme(), rows, () => {}, {
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

test("/pi-packages pressing d uninstalls selected third-party extension id", async () => {
	const removedSources: string[] = [];
	const modal = new PiPackagesModal(createTestTheme(), rows, () => {}, {
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

test("/pi-packages third-party search only captures text after slash", async () => {
	const queries: string[] = [];
	const modal = new PiPackagesModal(createTestTheme(), rows, () => {}, {
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
