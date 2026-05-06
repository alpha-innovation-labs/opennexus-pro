import assert from "node:assert/strict";
import test from "node:test";
import { createMiniSparkline } from "../../packages/mini-apps/src/wallet/trending/createMiniSparkline.js";

test("createMiniSparkline renders compact price movement", () => {
	assert.equal(createMiniSparkline([{ time: 1, price: 1 }, { time: 2, price: 2 }, { time: 3, price: 3 }], 3), "▁▅█");
});
