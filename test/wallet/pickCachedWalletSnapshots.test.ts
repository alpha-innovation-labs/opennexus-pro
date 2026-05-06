import assert from "node:assert/strict";
import test from "node:test";
import { pickCachedWalletSnapshots } from "../../packages/mini-apps/src/wallet/cache/pickCachedWalletSnapshots.js";

test("pickCachedWalletSnapshots returns cached snapshots in requested order", () => {
	const cache = {
		updatedAt: "now",
		rowsByPublicKey: {},
		snapshotsByPublicKey: {
			B: { sol: { index: 1, publicKey: "B", lamports: 2 }, tokens: [] },
			A: { sol: { index: 0, publicKey: "A", lamports: 1 }, tokens: [] },
		},
	};

	assert.deepEqual(pickCachedWalletSnapshots(cache, ["A", "C", "B"]).map((row) => row.sol.publicKey), ["A", "B"]);
});
