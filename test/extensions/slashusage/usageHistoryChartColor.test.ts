import assert from "node:assert/strict";
import test from "node:test";
import { createUsageHistoryLines } from "../../../packages/extensions/src/slashusage/history-modal/createUsageHistoryLines.js";

const TEAL = "\x1b[38;2;125;214;198m";
const ORANGE = "\x1b[38;2;230;170;80m";
const RED = "\x1b[38;2;210;90;90m";

/**
 * Creates percent records that cross the usage color thresholds.
 *
 * @returns Usage records spanning low, middle, and high usage.
 */
function createThresholdCrossingRecords() {
	return [0, 20, 40, 70, 100].map((value, index) => ({
		provider: "codex" as const,
		label: "Week",
		unit: "percent" as const,
		value,
		sampledAt: index,
		fetchedAt: index,
	}));
}

test("usage history chart colors percent rows teal, orange, then red", () => {
	const output = createUsageHistoryLines(createThresholdCrossingRecords(), 60, 23).join("\n");

	assert.ok(output.includes(RED));
	assert.ok(output.includes(ORANGE));
	assert.ok(output.includes(TEAL));
});
