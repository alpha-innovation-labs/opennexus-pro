import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { createExtensionFeatureFlags, registerEnabledExtensions } from "@nexus/feature-flags/index.js";
import { registerHotkeysCommandHook } from "./neo-editor/features/help-shortcuts/registerHotkeysCommandHook.js";
import { registerInternalSlashSelectorCommands } from "./neo-editor/features/menu/internal-commands/registerInternalSlashSelectorCommands.js";
import { registerSlashCommand } from "./neo-editor/features/menu/registerSlashCommand.js";
import { recordRegisteredShortcut } from "@nexus/tui-kit/shortcuts/recordRegisteredShortcut.js";

export { createExtensionFeatureFlags, createExtensionFeatureFlagReport, getEnabledExtensionFeatureFlags, readFeatureFlagsConfig } from "@nexus/feature-flags/index.js";

/**
 * Central extension entrypoint.
 *
 * @param pi Pi extension API.
 */
export default async function index(pi: ExtensionAPI): Promise<void> {
	const slashAwarePi = new Proxy(pi, {
		get(target, property, receiver) {
			if (property === "registerCommand") {
				return (name: string, definition: Record<string, unknown>) => {
					registerSlashCommand({
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
	registerHotkeysCommandHook();
	registerInternalSlashSelectorCommands(pi);
	await registerEnabledExtensions(slashAwarePi, createExtensionFeatureFlags());
}
