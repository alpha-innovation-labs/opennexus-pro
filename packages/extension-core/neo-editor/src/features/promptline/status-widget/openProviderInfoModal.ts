import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { createPanelOverlayOptions } from "@nexus/tui-kit/modal/createPanelOverlayOptions";
import type { ProviderInfoModal } from "./ProviderInfoModal";
import { ProviderInfoModal as ProviderInfoModalComponent } from "./ProviderInfoModal";

export type ProviderInfoOverlayHandle = { hide(): void; focus(): void };
export type ShowProviderInfoOverlay = (
	component: ProviderInfoModal,
	options?: unknown,
) => ProviderInfoOverlayHandle;

/**
 * Opens the provider info modal and wires its close callback to the overlay.
 *
 * @param uiTheme Active UI theme.
 * @param provider Provider name.
 * @param modelId Model identifier.
 * @param thinking Thinking level.
 * @param showOverlay Overlay factory.
 * @param onClose Callback invoked after the overlay closes.
 * @returns Modal and overlay handle.
 */
export function openProviderInfoModal(
	uiTheme: ExtensionContext["ui"]["theme"],
	provider: string,
	modelId: string,
	thinking: string,
	showOverlay: ShowProviderInfoOverlay,
	onClose: () => void,
): { modal: ProviderInfoModal; handle: ProviderInfoOverlayHandle } {
	let handle: ProviderInfoOverlayHandle | undefined;
	const modal = new ProviderInfoModalComponent(
		uiTheme,
		provider,
		modelId,
		thinking,
		() => {
			handle?.hide();
			onClose();
		},
	);
	handle = showOverlay(modal, createPanelOverlayOptions(48, "50%"));
	handle.focus();
	return { modal, handle };
}
