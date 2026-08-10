import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { clearRegisteredToolRecords, createExtensionFeatureFlags, getEnabledExtensionFeatureFlags, registerEnabledExtensions, setRuntimeExtensionFeatureFlags } from "@nexus/feature-flags/index";
import { clearHotkeysCommandHook } from "@extensions/hotkeys/clearHotkeysCommandHook";
import { clearRegisteredSlashCommands, registerSlashCommand } from "@extensions/slash-menu/registerSlashCommand";
import { recordRegisteredShortcut } from "@nexus/tui-kit/shortcuts/recordRegisteredShortcut";
import { createTronToolWrappingExtensionApi } from "@extensions/tron/compact-tool-lines/createTronToolWrappingExtensionApi";

// Re-export for backwards compatibility — consumers that reference
// these from @extensions still work.
export { createExtensionFeatureFlags, createExtensionFeatureFlagReport, getEnabledExtensionFeatureFlags } from "@nexus/feature-flags/index";

/**
 * Central extension entrypoint.
 *
 * @param pi Pi extension API.
 * @param skipExtensions Optional list of extension IDs to skip registration.
 * @param disabledFeatures CLI-level feature IDs to disable (overrides config.json).
 * @param enabledFeatures CLI-level feature IDs to force-enable (overrides config.json).
 */
export default async function registerBundledExtensions(
	pi: ExtensionAPI,
	skipExtensions?: string[],
	disabledFeatures?: string[],
	enabledFeatures?: string[],
): Promise<void> {
	clearRegisteredToolRecords();

	// Build CLI-level overrides.
	const cliDisabled = new Set(disabledFeatures ?? []);
	const cliEnabled = new Set(enabledFeatures ?? []);

	// Get the standard flags from the registry + user config.
	const standardFlags = createExtensionFeatureFlags();

	// Apply CLI overrides on top of standard flags.
	// disabledFeatures always wins, then enabledFeatures, then standard (config.json) state.
	const cliFlags = standardFlags.map((flag) => {
		if (cliDisabled.has(flag.id)) {
			return { ...flag, enabled: false };
		}
		if (cliEnabled.has(flag.id)) {
			return { ...flag, enabled: true };
		}
		return flag;
	});

	const isTronEnabled = cliFlags.some((flag) => flag.id === "tron" && flag.enabled);
	const isSlashMenuEnabled = cliFlags.some((flag) => flag.id === "slash-menu" && flag.enabled);
	if (!cliFlags.some((flag) => flag.id === "hotkeys" && flag.enabled)) clearHotkeysCommandHook();
	if (!isSlashMenuEnabled) clearRegisteredSlashCommands();
	const toolAwarePi = isTronEnabled ? createTronToolWrappingExtensionApi(pi) : pi;
	const slashAwarePi = new Proxy(toolAwarePi, {
		get(target, property, receiver) {
			if (property === "registerCommand") {
				return (name: string, definition: Record<string, unknown>) => {
					if (isSlashMenuEnabled) registerSlashCommand({
						name,
						description: typeof definition.description === "string" ? definition.description : undefined,
						source: "extension",
						menuGroup: typeof definition.menuGroup === "string" ? definition.menuGroup : undefined,
						handler: typeof definition.handler === "function" ? definition.handler as never : undefined,
					});
					return target.registerCommand(name, definition as never);
				};
			}
			if (property === "registerShortcut") {
				return (shortcut: string, definition: Record<string, unknown>) => {
					recordRegisteredShortcut(shortcut, definition);
					return target.registerShortcut(shortcut as never, definition as never);
				};
			}
			return Reflect.get(target, property, receiver);
		},
	});

	// Set runtime state with CLI-overridden flags.
	setRuntimeExtensionFeatureFlags(cliFlags);

	// Only register enabled extensions, excluding skipExtensions.
	const enabledFlags = getEnabledExtensionFeatureFlags(cliFlags);
	const filteredFlags = skipExtensions
		? enabledFlags.filter((flag) => !skipExtensions.includes(flag.id))
		: enabledFlags;
	const { createExtensionRegistrationTask } = await import("@nexus/feature-flags/createExtensionRegistrationTask");
	await Promise.all(filteredFlags.map((flag) => createExtensionRegistrationTask(slashAwarePi, flag)));
}
