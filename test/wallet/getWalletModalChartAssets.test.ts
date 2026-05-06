import assert from "node:assert/strict";
import test from "node:test";
import { getWalletModalChartAssets } from "../../packages/mini-apps/src/wallet/ui/getWalletModalChartAssets.js";

test("getWalletModalChartAssets includes SOL before SPL tokens", () => {
	const assets = getWalletModalChartAssets({
		loading: false,
		selectedTokenIndex: 0,
		status: "",
		updatedAt: "",
		snapshots: [{
			sol: { index: 0, publicKey: "AccountOne", lamports: 1 },
			tokens: [{ ownerIndex: 0, ownerPublicKey: "AccountOne", mint: "Mint", tokenAccount: "Token", amount: "2", decimals: 0, uiAmount: "2", symbol: "TOK" }],
		}],
	});

	assert.deepEqual(assets, [
		{ label: "SOL", mint: "So11111111111111111111111111111111111111112" },
		{ label: "TOK", mint: "Mint" },
	]);
});
