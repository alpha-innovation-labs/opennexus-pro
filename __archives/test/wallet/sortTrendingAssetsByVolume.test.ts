import assert from "node:assert/strict";
import test from "node:test";
import { sortTrendingAssetsByVolume } from "../../packages/mini-apps/src/wallet/trending/sortTrendingAssetsByVolume.js";

test("sortTrendingAssetsByVolume sorts descending by 6h buy plus sell volume", () => {
	const rows = sortTrendingAssetsByVolume([
		{ id: "a", name: "A", symbol: "A", usdPrice: 1, liquidity: 1, stats6h: { buyVolume: 1, sellVolume: 1 } },
		{ id: "b", name: "B", symbol: "B", usdPrice: 1, liquidity: 1, stats6h: { buyVolume: 10, sellVolume: 1 } },
	]);

	assert.deepEqual(rows.map((row) => row.id), ["b", "a"]);
});
