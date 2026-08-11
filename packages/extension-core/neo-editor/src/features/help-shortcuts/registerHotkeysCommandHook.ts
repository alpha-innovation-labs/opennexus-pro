import { setHotkeysCommandHook } from "@nexus/pi-platform/hotkeysCommandHook";
import { createPanelOverlayOptions } from "@nexus/tui-kit/modal/createPanelOverlayOptions";
import { HelpShortcutsModal } from "./HelpShortcutsModal";

/**
 * Registers the Nexus-owned renderer for Pi's built-in /hotkeys command.
 */
export function registerHotkeysCommandHook(): void {
	setHotkeysCommandHook((mode) => {
		const ui = (
			mode as {
				createExtensionUIContext?: () => {
					custom: <T>(
						factory: (...args: never[]) => unknown,
						options?: unknown,
					) => Promise<T>;
				};
			}
		).createExtensionUIContext?.();
		if (!ui) return;
		void ui.custom<void>(
			(_tui, theme, _keybindings, done) => new HelpShortcutsModal(theme, done),
			{
				overlay: true,
				overlayOptions: createPanelOverlayOptions(80),
			},
		);
	});
}
