import assert from "node:assert/strict";
import test from "node:test";
import { createMiniLineChart } from "../../packages/mini-apps/src/wallet/trending/createMiniLineChart.js";

test("createMiniLineChart renders compact braille line movement", () => {
	const line = createMiniLineChart([{ time: 1, price: 1 }, { time: 2, price: 2 }, { time: 3, price: 1 }], 3);

	assert.match(line, /[⠁-⣿]/u);
	assert.equal(line.length, 3);
});
