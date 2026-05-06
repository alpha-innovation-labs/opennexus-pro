import assert from "node:assert/strict";
import test from "node:test";
import { renderTokenPriceChart } from "../../packages/mini-apps/src/wallet/chart/renderTokenPriceChart.js";

test("renderTokenPriceChart renders a usage-style price line chart with time labels", () => {
	const lines = renderTokenPriceChart("TOK", [
		{ time: Date.UTC(2026, 0, 1, 0, 0), open: 1, high: 1, low: 1, close: 1 },
		{ time: Date.UTC(2026, 0, 1, 4, 0), open: 2, high: 2, low: 2, close: 2 },
		{ time: Date.UTC(2026, 0, 1, 8, 0), open: 1.5, high: 1.5, low: 1.5, close: 1.5 },
	], 40, 16);
	const output = lines.join("\n");

	assert.match(output, /TOK · 4h USD price/u);
	assert.doesNotMatch(output, /old.*now/u);
	assert.match(output, /\d{2}\/\d{2} \d{2}:\d{2}.*\d{2}\/\d{2} \d{2}:\d{2}/u);
	assert.ok(lines.some((line) => /[⠁-⣿]/u.test(line)), output);
	assert.ok(lines.length >= 15, output);
});
