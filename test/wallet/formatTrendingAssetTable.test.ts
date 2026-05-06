import assert from "node:assert/strict";
import test from "node:test";
import { formatTrendingAssetTable } from "../../packages/mini-apps/src/wallet/trending/formatTrendingAssetTable.js";

test("formatTrendingAssetTable renders Jupiter trending rows", () => {
	const lines = formatTrendingAssetTable([{
		id: "Mint",
		name: "Token",
		symbol: "TOK",
		usdPrice: 0.1234,
		liquidity: 1_000_000,
		mcap: 2_000_000,
		stats6h: { priceChange: 12.34, numTraders: 567 },
	}]);
	const output = lines.join("\n");

	assert.match(output, /Token\s+Price\s+6h/u);
	assert.match(output, /TOK/u);
	assert.match(output, /\+12\.34%/u);
});
