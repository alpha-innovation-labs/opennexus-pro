import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { createExtensionFeatureFlags, registerEnabledExtensions } from "../feature-flags/index.js";
import { registerInternalSlashSelectorCommands } from "./shared/slash-menu/internal-commands/registerInternalSlashSelectorCommands.js";
import { registerSlashCommand } from "./shared/slash-menu/registerSlashCommand.js";

export { createExtensionFeatureFlags, createExtensionFeatureFlagReport, getEnabledExtensionFeatureFlags, readFeatureFlagsConfig } from "../feature-flags/index.js";

/**
 * Central extension entrypoint.
 *
 * @param pi Pi extension API.
 */
export default function index(pi: ExtensionAPI): void {
	const slashAwarePi = new Proxy(pi, {
		get(target, property, receiver) {
			if (property === "registerCommand") {
				return (name: string, definition: Record<string, unknown>) => {
					registerSlashCommand({
						name,
						description: typeof definition.description === "string" ? definition.description : undefined,
						source: "extension",
						handler: typeof definition.handler === "function" ? definition.handler as never : undefined,
					});
					return target.registerCommand(name, definition as never);
				};
			}
			return Reflect.get(target, property, receiver);
		},
	});
	registerInternalSlashSelectorCommands(pi);
	registerEnabledExtensions(slashAwarePi, createExtensionFeatureFlags());
}
