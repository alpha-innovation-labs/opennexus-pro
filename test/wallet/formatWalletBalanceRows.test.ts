import assert from "node:assert/strict";
import test from "node:test";
import { formatWalletBalanceRows } from "../../packages/mini-apps/src/wallet/format/formatWalletBalanceRows.js";

test("formatWalletBalanceRows renders one account per line", () => {
	const output = formatWalletBalanceRows([
		{ index: 0, publicKey: "AccountOne", lamports: 1_500_000_000 },
		{ index: 1, publicKey: "AccountTwo", lamports: 2 },
	]);

	assert.equal(output, "1. AccountOne  1.5 SOL\n2. AccountTwo  0.000000002 SOL");
});
