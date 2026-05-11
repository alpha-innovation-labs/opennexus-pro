import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { createWalletPanelOverlayOptions } from "../ui/createWalletPanelOverlayOptions.js";
import { loadCachedWalletRows } from "./loadCachedWalletRows.js";
import { refreshWalletRows } from "./refreshWalletRows.js";
import { WalletModal } from "../ui/WalletModal.js";
import type { WalletModalState } from "../ui/WalletModalState.js";

/**
 * Opens the wallet balance modal and refreshes only for first fetch or user r.
 *
 * @param ctx Extension command context.
 * @param mnemonic Recovery phrase used to derive public keys.
 * @param count Account count.
 */
export async function showWalletModal(ctx: ExtensionCommandContext, mnemonic: string, count: number): Promise<void> {
	const initialState = await loadCachedWalletRows(mnemonic, count);
	await ctx.ui.custom<void>((tui, theme, _keybindings, done) => {
		let currentState: WalletModalState = initialState;
		let modal: WalletModal;
		const refresh = async () => {
			try {
				currentState = await refreshWalletRows(mnemonic, count);
				modal.setState(currentState);
			} catch (error) {
				const message = error instanceof Error ? error.message : "Wallet refresh failed.";
				modal.setState({ ...currentState, loading: false, status: message });
			}
		};
		modal = new WalletModal({ fullScreenRows: () => tui.terminal.rows, onClose: done, onRenderNeeded: () => tui.requestRender(), onRefresh: refresh, state: initialState, theme });
		if (initialState.snapshots.length === 0) setTimeout(() => void modal.refreshBalances(), 0);
		return modal;
	}, { overlay: true, overlayOptions: createWalletPanelOverlayOptions(120, "100%") });
}
