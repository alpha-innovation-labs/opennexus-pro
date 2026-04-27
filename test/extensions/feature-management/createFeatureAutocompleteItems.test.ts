import assert from "node:assert/strict";
import test from "node:test";
import { colorFeatureChannel } from "../../../packages/extensions/src/feature-management/ui/colorFeatureChannel.js";
import { colorFeatureStatus } from "../../../packages/extensions/src/feature-management/ui/colorFeatureStatus.js";
import { createFeatureAutocompleteItems } from "../../../packages/extensions/src/feature-management/ui/createFeatureAutocompleteItems.js";
import type { FeatureStatusRow } from "../../../packages/extensions/src/feature-management/model/types.js";

const rows: FeatureStatusRow[] = [
	{
		extensionId: "alpha",
		feature: "alpha",
		status: "enabled",
		channel: "production",
		group: "Production",
	},
	{
		extensionId: "longer-feature",
		feature: "longer-feature",
		status: "disabled",
		channel: "dev",
		group: "Playground",
	},
];

test("feature autocomplete items render current values in aligned columns", () => {
	const labels = createFeatureAutocompleteItems(rows, "status").map((item) => item.label);

	assert.deepEqual(labels, [
		"longer-feature  › disabled    dev",
		"alpha           › enabled     production",
	]);
	assert.equal(labels[0]?.indexOf("›"), labels[1]?.indexOf("›"));
	assert.equal(labels[0]?.indexOf("dev"), labels[1]?.indexOf("production"));
});

test("feature autocomplete items move the active marker to the channel value", () => {
	const [, second] = createFeatureAutocompleteItems(rows, "channel");

	assert.equal(second?.label, "alpha             enabled   › production");
});

test("feature autocomplete items expose Playground and Production group labels", () => {
	const items = createFeatureAutocompleteItems(rows, "status");

	assert.deepEqual(items.map((item) => (item as { groupLabel?: string }).groupLabel), ["Playground", "Production"]);
});

test("feature values use Tron palette theme keys", () => {
	const calls: Array<{ color: string; value: string }> = [];
	const theme = {
		fg(color: string, value: string): string {
			calls.push({ color, value });
			return value;
		},
	};

	colorFeatureStatus("enabled", theme);
	colorFeatureStatus("disabled", theme);
	colorFeatureChannel("production", theme);
	colorFeatureChannel("dev", theme);

	assert.deepEqual(calls, [
		{ color: "syntaxType", value: "enabled" },
		{ color: "error", value: "disabled" },
		{ color: "syntaxType", value: "production" },
		{ color: "error", value: "dev" },
	]);
});
