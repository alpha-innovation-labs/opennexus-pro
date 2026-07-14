import assert from "node:assert/strict";
import test from "node:test";
import { renderTokenPriceTimeAxis } from "../../packages/mini-apps/src/wallet/chart/renderTokenPriceTimeAxis.js";

test("renderTokenPriceTimeAxis renders first and last candle dates and times", () => {
	const line = renderTokenPriceTimeAxis([
		{ time: Date.UTC(2026, 0, 1, 0, 0), open: 1, high: 1, low: 1, close: 1 },
		{ time: Date.UTC(2026, 0, 2, 8, 0), open: 1, high: 1, low: 1, close: 1 },
	], 34);

	assert.match(line, /\d{2}\/\d{2} \d{2}:\d{2}.*\d{2}\/\d{2} \d{2}:\d{2}/u);
});
