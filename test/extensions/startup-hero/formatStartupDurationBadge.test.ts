import assert from "node:assert/strict";
import test from "node:test";
import { formatStartupDurationBadge } from "../../../packages/extensions/src/startup-hero/formatStartupDurationBadge.js";

test("formatStartupDurationBadge formats seconds and centiseconds", () => {
	assert.equal(formatStartupDurationBadge(2260), "[⏱ 2:26]");
	assert.equal(formatStartupDurationBadge(879), "[⏱ 0:87]");
});
