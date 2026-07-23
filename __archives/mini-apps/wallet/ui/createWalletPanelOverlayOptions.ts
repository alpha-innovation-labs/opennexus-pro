export type WalletPanelOverlayOptions = {
	anchor: "center";
	width: "100%";
	minWidth: number;
	maxHeight: string;
};

/**
 * Creates full-width overlay options for the wallet mini-app panel.
 *
 * @param minWidth Minimum overlay width.
 * @param maxHeight Maximum overlay height.
 * @returns Wallet panel overlay options.
 */
export function createWalletPanelOverlayOptions(minWidth: number, maxHeight = "90%"): WalletPanelOverlayOptions {
	return { anchor: "center", width: "100%", minWidth, maxHeight };
}
