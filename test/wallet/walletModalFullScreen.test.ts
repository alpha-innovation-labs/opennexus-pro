import assert from "node:assert/strict";
import test from "node:test";
import { WalletModal } from "../../packages/mini-apps/src/wallet/ui/WalletModal.js";
import { createTestTheme } from "../support/theme/createTestTheme.js";

test("WalletModal renders full screen width and height", () => {
	const modal = new WalletModal({
		fullScreenRows: 30,
		onClose: () => undefined,
		onRefresh: async () => undefined,
		onRenderNeeded: () => undefined,
		state: { loading: false, selectedTokenIndex: 0, snapshots: [], status: "", updatedAt: "" },
		theme: createTestTheme(),
	});
	const lines = modal.render(120);

	assert.equal(lines[0]?.length, 120);
	assert.equal(lines.length, 30);
});
