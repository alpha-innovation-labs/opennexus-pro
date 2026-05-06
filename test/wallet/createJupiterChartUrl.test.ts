import assert from "node:assert/strict";
import test from "node:test";
import { createJupiterChartUrl } from "../../packages/mini-apps/src/wallet/chart/createJupiterChartUrl.js";

test("createJupiterChartUrl creates 4-hour USD price chart URL", () => {
	assert.equal(
		createJupiterChartUrl("6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN", 1778025702000, 100),
		"https://datapi.jup.ag/v2/charts/6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN?interval=4_HOUR&to=1778025702000&candles=100&type=price&quote=usd",
	);
});
