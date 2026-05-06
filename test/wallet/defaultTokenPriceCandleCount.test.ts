import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_TOKEN_PRICE_CANDLE_COUNT } from "../../packages/mini-apps/src/wallet/chart/DEFAULT_TOKEN_PRICE_CANDLE_COUNT.js";

test("DEFAULT_TOKEN_PRICE_CANDLE_COUNT requests 1000 candles", () => {
	assert.equal(DEFAULT_TOKEN_PRICE_CANDLE_COUNT, 1000);
});
