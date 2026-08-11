import { readKeybindingsConfigFile } from "./readKeybindingsConfigFile";
import { removeConflictingHotkeysBindings } from "./removeConflictingHotkeysBindings";
import type { HotkeysKeybindings } from "./types";
import { writeKeybindingsConfigFile } from "./writeKeybindingsConfigFile";

/**
 * Persists one keybinding override to the active keybindings manager and config file.
 *
 * @param keybindings Active Pi/Nexus keybindings manager.
 * @param keybindingId Keybinding id to override.
 * @param key Key identifier captured from terminal input.
 * @param overriddenKeybindingIds Existing keybindings that should release the key.
 * @returns Saved config path, when persistence was possible.
 */
export function saveHotkeysBinding(
	keybindings: HotkeysKeybindings,
	keybindingId: string,
	key: string,
	overriddenKeybindingIds: string[] = [],
): string | undefined {
	const configPath = keybindings.configPath;
	const fileConfig = configPath ? readKeybindingsConfigFile(configPath) : {};
	const managerConfig = keybindings.getUserBindings?.() ?? {};
	const mergedConfig = { ...fileConfig, ...managerConfig };
	const unboundConfig = removeConflictingHotkeysBindings(
		mergedConfig,
		overriddenKeybindingIds,
		key,
	);
	const nextConfig = { ...unboundConfig, [keybindingId]: key };
	if (configPath) writeKeybindingsConfigFile(configPath, nextConfig);
	keybindings.setUserBindings?.(nextConfig);
	keybindings.reload?.();
	return configPath;
}
