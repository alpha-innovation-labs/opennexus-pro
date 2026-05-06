import assert from "node:assert/strict";
import test from "node:test";
import { resetCapabilitiesCache, setCapabilities } from "@mariozechner/pi-tui";
import { WalletModal } from "../../packages/mini-apps/src/wallet/ui/WalletModal.js";
import { createTestTheme } from "../support/theme/createTestTheme.js";

/**
 * Creates a wallet modal with one cached token image payload.
 *
 * @returns Wallet modal instance.
 */
function createImageWalletModal(): WalletModal {
	return new WalletModal({
		onClose: () => undefined,
		onRefresh: async () => undefined,
		onRenderNeeded: () => undefined,
		state: {
			loading: false,
			selectedTokenIndex: 0,
			status: "Showing cached balances.",
			updatedAt: "now",
			snapshots: [{
				sol: { index: 0, publicKey: "AccountOne", lamports: 1 },
				tokens: [{ ownerIndex: 0, ownerPublicKey: "AccountOne", mint: "Mint", tokenAccount: "Token", amount: "2", decimals: 0, uiAmount: "2", symbol: "TOK", imageBase64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=", imageMimeType: "image/png" }],
			}],
		},
		theme: createTestTheme(),
	});
}

test("WalletModal emits terminal inline image sequence when supported", () => {
	setCapabilities({ images: "iterm2", trueColor: true, hyperlinks: true });
	try {
		assert.match(createImageWalletModal().render(120).join("\n"), /\u001b\]1337;File=/u);
	} finally {
		resetCapabilitiesCache();
	}
});
