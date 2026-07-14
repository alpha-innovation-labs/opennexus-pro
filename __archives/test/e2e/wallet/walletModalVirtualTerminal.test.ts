import assert from "node:assert/strict";
import test from "node:test";
import { WalletModal } from "../../../packages/mini-apps/src/wallet/ui/WalletModal.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

test("/wallet modal renders cached token image links in virtual terminal", async () => {
	const viewport = await renderComponentInVirtualTerminal(() => new WalletModal({
		fullScreenRows: 20,
		onClose: () => undefined,
		onRefresh: async () => undefined,
		onRenderNeeded: () => undefined,
		state: {
			loading: false,
			selectedTokenIndex: 0,
			status: "Showing cached balances.",
			updatedAt: "2026-05-06T00:00:00.000Z",
			snapshots: [{
				sol: { index: 0, publicKey: "AccountOne", lamports: 1_500_000_000 },
				tokens: [{ ownerIndex: 0, ownerPublicKey: "AccountOne", mint: "Mint", tokenAccount: "Token", amount: "2", decimals: 0, uiAmount: "2", symbol: "TOK", imageUrl: "https://img.test/tok.png", imageBase64: "iVBORw0KGgo=", imageMimeType: "image/png" }],
			}],
		},
		theme: createTestTheme(),
	}), 120, 20);
	const output = viewport.join("\n");

	assert.match(output, /TOK\s+2/u);
	assert.match(output, /🖼 https:\/\/img\.test\/tok\.png/u);
	assert.match(output, /Token image: TOK/u);
});
