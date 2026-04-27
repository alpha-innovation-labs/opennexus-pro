import assert from "node:assert/strict";
import test from "node:test";
import { filterFeatureStatusRows } from "../../../packages/extensions/src/feature-management/ui/filterFeatureStatusRows.js";
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
		extensionId: "dev-tools",
		feature: "dev-tools",
		status: "disabled",
		channel: "dev",
		group: "Playground",
	},
];

test("feature status row filtering matches typed text case-insensitively", () => {
	assert.deepEqual(filterFeatureStatusRows(rows, "DEV"), [rows[1]]);
	assert.deepEqual(filterFeatureStatusRows(rows, "alp"), [rows[0]]);
	assert.deepEqual(filterFeatureStatusRows(rows, ""), rows);
});
