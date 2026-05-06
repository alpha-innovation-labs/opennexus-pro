import assert from "node:assert/strict";
import test from "node:test";
import { formatWalletSnapshots } from "../../packages/mini-apps/src/wallet/format/formatWalletSnapshots.js";

test("formatWalletSnapshots renders SOL and token rows", () => {
	const output = formatWalletSnapshots([
		{
			sol: { index: 0, publicKey: "AccountOne", lamports: 1_500_000_000 },
			tokens: [{ ownerIndex: 0, ownerPublicKey: "AccountOne", mint: "Mint", tokenAccount: "Token", amount: "2", decimals: 0, uiAmount: "2", symbol: "BONK", imageUrl: "https://logo.test/bonk.png" }],
		},
	]);

	assert.equal(output, "1. AccountOne  1.5 SOL\n   • BONK  2 🖼 https://logo.test/bonk.png");
});
