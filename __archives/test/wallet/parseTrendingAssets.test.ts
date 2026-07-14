import assert from "node:assert/strict";
import test from "node:test";
import { parseTrendingAssets } from "../../packages/mini-apps/src/wallet/trending/parseTrendingAssets.js";

test("parseTrendingAssets parses Jupiter top-trending payload", () => {
	assert.deepEqual(parseTrendingAssets({
		assets: [{ id: "Mint", name: "Token", symbol: "TOK", usdPrice: 1, liquidity: 2, stats6h: { priceChange: 3, numTraders: 4 } }],
		sparklines: { Mint: [{ time: 1, price: 1 }, { time: 2, price: 2 }] },
	}), [{
		id: "Mint",
		name: "Token",
		symbol: "TOK",
		usdPrice: 1,
		liquidity: 2,
		mcap: undefined,
		fdv: undefined,
		holderCount: undefined,
		stats6h: { priceChange: 3, buyVolume: undefined, sellVolume: undefined, numTraders: 4 },
		sparkline: [{ time: 1, price: 1 }, { time: 2, price: 2 }],
	}]);
});
