import assert from "node:assert/strict";
import test from "node:test";
import { mergeWalletSnapshots } from "../../packages/mini-apps/src/wallet/cache/mergeWalletSnapshots.js";

test("mergeWalletSnapshots stores fresh snapshots by public key", () => {
	const merged = mergeWalletSnapshots({ updatedAt: "old", rowsByPublicKey: {}, snapshotsByPublicKey: {} }, [
		{ sol: { index: 0, publicKey: "A", lamports: 9 }, tokens: [{ ownerIndex: 0, ownerPublicKey: "A", mint: "M", tokenAccount: "T", amount: "1", decimals: 0, uiAmount: "1" }] },
	]);

	assert.equal(merged.rowsByPublicKey.A?.lamports, 9);
	assert.equal(merged.snapshotsByPublicKey.A?.tokens[0]?.mint, "M");
	assert.notEqual(merged.updatedAt, "old");
});
