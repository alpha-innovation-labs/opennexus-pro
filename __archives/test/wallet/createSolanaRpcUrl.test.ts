import assert from "node:assert/strict";
import test from "node:test";
import { createSolanaRpcUrl } from "../../packages/mini-apps/src/wallet/config/createSolanaRpcUrl.js";

test("createSolanaRpcUrl defaults to public mainnet RPC", () => {
	assert.equal(createSolanaRpcUrl({}), "https://api.mainnet-beta.solana.com");
});

test("createSolanaRpcUrl allows explicit RPC override", () => {
	assert.equal(createSolanaRpcUrl({ SOLANA_RPC_URL: " https://example.test " }), "https://example.test");
});
