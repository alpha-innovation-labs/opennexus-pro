import { isRuntimeExtensionFeatureEnabled } from "@nexus/feature-flags/runtimeExtensionFeatureState";
import { setHotkeysCommandHook } from "@nexus/pi-platform/hotkeysCommandHook";
import { createPanelOverlayOptions } from "@nexus/tui-kit/modal/createPanelOverlayOptions";
import { getModeExtensionShortcuts } from "./getModeExtensionShortcuts";
import { getModeKeybindings } from "./getModeKeybindings";
import { HotkeysModal } from "./HotkeysModal";

/**
 * Registers the Nexus hotkeys renderer for Pi's built-in /hotkeys command.
 */
export function registerHotkeysCommandHook(): void {
	setHotkeysCommandHook((mode) => {
		if (!isRuntimeExtensionFeatureEnabled("hotkeys")) {
			setHotkeysCommandHook(undefined);
			return;
		}
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
		const modeKeybindings = getModeKeybindings(mode);
		if (!ui || !modeKeybindings) return;
		void ui.custom<void>(
			(_tui, theme, keybindings, done) =>
				new HotkeysModal(
					theme,
					keybindings as never,
					getModeExtensionShortcuts(mode, modeKeybindings),
					done,
				),
			{
				overlay: true,
				overlayOptions: createPanelOverlayOptions(92, "100%"),
			},
		);
	});
}
