import assert from "node:assert/strict";
import test from "node:test";
import { formatTrendingAssetTable } from "../../packages/mini-apps/src/wallet/trending/formatTrendingAssetTable.js";

test("formatTrendingAssetTable marks selected sorted row", () => {
	const lines = formatTrendingAssetTable([
		{ id: "low", name: "Low", symbol: "LOW", usdPrice: 1, liquidity: 1, stats6h: { buyVolume: 1, sellVolume: 1 } },
		{ id: "high", name: "High", symbol: "HIGH", usdPrice: 1, liquidity: 1, stats6h: { buyVolume: 10, sellVolume: 10 } },
	], 0);

	assert.match(lines[2] ?? "", /^  › HIGH/u);
});
