import assert from "node:assert/strict";
import test from "node:test";
import { FeatureManagementModal } from "../../../src/extensions/feature-management/ui/FeatureManagementModal.js";
import type { FeatureStatusRow } from "../../../src/extensions/feature-management/model/types.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

const rows: FeatureStatusRow[] = [
	{
		extensionId: "alpha",
		feature: "alpha command",
		status: "enabled",
		channel: "production",
	},
	{
		extensionId: "dev-tools",
		feature: "dev-only feature browser",
		status: "disabled",
		channel: "dev",
	},
];

test("/features modal renders all features with enabled and channel status", async () => {
	const viewport = await renderComponentInVirtualTerminal(
		() => new FeatureManagementModal(createTestTheme(), rows, () => {}),
		140,
		22,
	);
	const output = viewport.join("\n");

	assert.match(output, /Features/u);
	assert.match(output, /alpha command/u);
	assert.match(output, /Runtime status/u);
	assert.match(output, /enabled/u);
	assert.match(output, /Release channel/u);
	assert.match(output, /production/u);
	assert.match(output, /dev-only feature browser/u);
	assert.match(output, /disabled · dev/u);
});
