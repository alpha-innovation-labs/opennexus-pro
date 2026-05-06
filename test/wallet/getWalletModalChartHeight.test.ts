import assert from "node:assert/strict";
import test from "node:test";
import { getWalletModalChartHeight } from "../../packages/mini-apps/src/wallet/ui/getWalletModalChartHeight.js";

test("getWalletModalChartHeight uses most fullscreen rows", () => {
	assert.equal(getWalletModalChartHeight(40), 32);
});
