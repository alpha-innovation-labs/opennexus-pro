import assert from "node:assert/strict";
import test from "node:test";
import { FeatureManagementModal } from "../../../packages/extensions/src/feature-management/ui/FeatureManagementModal.js";
import type { FeatureStatusRow } from "../../../packages/extensions/src/feature-management/model/types.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

const rows: FeatureStatusRow[] = [
	{
		category: "extensions",
		sourceCategory: "extensions",
		extensionId: "alpha",
		feature: "alpha",
		status: "enabled",
		channel: "production",
		group: "Production",
	},
	{
		category: "extensions",
		sourceCategory: "extensions",
		extensionId: "dev-tools",
		feature: "dev-tools",
		status: "disabled",
		channel: "dev",
		group: "Playground",
	},
];

test("/features modal renders extension rows without a right detail pane", async () => {
	const viewport = await renderComponentInVirtualTerminal(
		() => new FeatureManagementModal(createTestTheme(), rows, () => {}),
		140,
		30,
	);
	const output = viewport.join("\n");

	assert.match(output, /Features/u);
	assert.match(output, /Playground/u);
	assert.match(output, /Production/u);
	assert.match(output, /alpha\s+› enabled\s+production/u);
	assert.match(output, /dev-tools\s+› disabled\s+dev/u);
	assert.doesNotMatch(output, /○ enabled/u);
	assert.doesNotMatch(output, /● disabled/u);
	assert.doesNotMatch(output, /Runtime status/u);
	assert.doesNotMatch(output, /Release channel/u);
	assert.doesNotMatch(output, /Status/u);
});

test("/features modal filters rows when typing", () => {
	const modal = new FeatureManagementModal(createTestTheme(), rows, () => {});

	modal.handleInput("d");
	const filteredOutput = modal.render(140).join("\n");
	modal.handleInput("\u007f");
	const restoredOutput = modal.render(140).join("\n");

	assert.match(filteredOutput, /dev-tools/u);
	assert.doesNotMatch(filteredOutput, /alpha\s+› enabled/u);
	assert.match(restoredOutput, /dev-tools/u);
	assert.match(restoredOutput, /alpha\s+› enabled/u);
});

test("/features modal clears the active filter on escape before closing", () => {
	let closed = false;
	const modal = new FeatureManagementModal(createTestTheme(), rows, () => {
		closed = true;
	});

	modal.handleInput("d");
	modal.handleInput("\x1b");
	const output = modal.render(140).join("\n");

	assert.equal(closed, false);
	assert.match(output, /dev-tools/u);
	assert.match(output, /alpha\s+› enabled/u);
});

test("/features modal uses space to choose the status or channel toggle", () => {
	let updatedRows = rows;
	const patches: Array<{ extensionId: string; patch: { channel?: string; status?: string } }> = [];
	const modal = new FeatureManagementModal(createTestTheme(), rows, () => {}, (extensionId, patch) => {
		patches.push({ extensionId, patch });
		updatedRows = updatedRows.map((row) => (row.extensionId === extensionId ? { ...row, ...patch } : row));
		return updatedRows;
	});

	modal.handleInput("\r");
	modal.handleInput(" ");
	modal.handleInput("\r");
	modal.handleInput("\x1b[B");
	modal.handleInput("\r");

	assert.deepEqual(patches, [
		{ extensionId: "dev-tools", patch: { status: "enabled" } },
		{ extensionId: "dev-tools", patch: { channel: "production" } },
		{ extensionId: "alpha", patch: { channel: "dev" } },
	]);
});

test("/features modal uses tab and shift+tab to switch Extensions and Mini-Apps", () => {
	const modal = new FeatureManagementModal(createTestTheme(), [
		...rows,
		{
			category: "mini-apps",
			sourceCategory: "other",
			extensionId: "social-chat",
			feature: "social-chat",
			status: "disabled",
			channel: "dev",
			group: "Playground",
		},
	], () => {});

	const extensionsOutput = modal.render(140).join("\n");
	modal.handleInput("\t");
	const miniAppsOutput = modal.render(140).join("\n");
	modal.handleInput("\t");
	const cycledOutput = modal.render(140).join("\n");
	modal.handleInput("\x1b[Z");
	const restoredOutput = modal.render(140).join("\n");

	assert.match(extensionsOutput, /● Extensions \| ○ Mini-Apps/u);
	assert.doesNotMatch(extensionsOutput, /All|Other/u);
	assert.match(extensionsOutput, /alpha/u);
	assert.doesNotMatch(extensionsOutput, /social-chat/u);
	assert.match(miniAppsOutput, /○ Extensions \| ● Mini-Apps/u);
	assert.match(miniAppsOutput, /social-chat/u);
	assert.doesNotMatch(miniAppsOutput, /alpha\s+› enabled/u);
	assert.match(cycledOutput, /● Extensions \| ○ Mini-Apps/u);
	assert.match(restoredOutput, /○ Extensions \| ● Mini-Apps/u);
});
