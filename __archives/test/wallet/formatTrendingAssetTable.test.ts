import assert from "node:assert/strict";
import test from "node:test";
import { formatTrendingAssetTable } from "../../packages/mini-apps/src/wallet/trending/formatTrendingAssetTable.js";

test("formatTrendingAssetTable renders rows with line chart and volume", () => {
	const lines = formatTrendingAssetTable([{
		id: "Mint",
		name: "Token",
		symbol: "TOK",
		usdPrice: 0.1234,
		liquidity: 1_000_000,
		mcap: 2_000_000,
		stats6h: { priceChange: 12.34, buyVolume: 100, sellVolume: 50, numTraders: 567 },
		sparkline: [{ time: 1, price: 1 }, { time: 2, price: 2 }, { time: 3, price: 1 }],
	}]);
	const output = lines.join("\n");

	assert.match(output, /Token\s+Price\s+6h\s+Line\s+Vol/u);
	assert.match(output, /TOK/u);
	assert.match(output, /\+12\.34%/u);
	assert.match(output, /[⠁-⣿]/u);
	assert.match(output, /150/u);
});
