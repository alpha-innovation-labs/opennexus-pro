import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { createExtensionFeatureFlags, registerEnabledExtensions } from "@nexus/feature-flags/index.js";
import { clearHotkeysCommandHook } from "./hotkeys/clearHotkeysCommandHook.js";
import { clearRegisteredSlashCommands, registerSlashCommand } from "./slash-menu/registerSlashCommand.js";
import { recordRegisteredShortcut } from "@nexus/tui-kit/shortcuts/recordRegisteredShortcut.js";
import { registerTelemetryRuntimeExtension } from "./telemetry-runtime/registerTelemetryRuntimeExtension.js";
import { createTronToolWrappingExtensionApi } from "./tron/compact-tool-lines/createTronToolWrappingExtensionApi.js";

export { createExtensionFeatureFlags, createExtensionFeatureFlagReport, getEnabledExtensionFeatureFlags, readFeatureFlagsConfig } from "@nexus/feature-flags/index.js";

/**
 * Central extension entrypoint.
 *
 * @param pi Pi extension API.
 */
export default async function index(pi: ExtensionAPI): Promise<void> {
	const flags = createExtensionFeatureFlags();
	const isTronEnabled = flags.some((flag) => flag.id === "tron" && flag.enabled);
	const isSlashMenuEnabled = flags.some((flag) => flag.id === "slash-menu" && flag.enabled);
	if (!flags.some((flag) => flag.id === "hotkeys" && flag.enabled)) clearHotkeysCommandHook();
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
	registerTelemetryRuntimeExtension(pi);
	await registerEnabledExtensions(slashAwarePi, flags);
}
