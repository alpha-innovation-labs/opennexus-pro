import { SettingsManager } from "../../../../../../../node_modules/@mariozechner/pi-coding-agent/dist/core/settings-manager.js";
import type { ExtensionCommandContext, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { removeProviderFromEnabledModels, type EnabledModelSettings } from "./removeProviderFromEnabledModels.js";

/**
 * Removes stored auth for a provider and refreshes model availability.
 *
 * @param ctx Extension context with auth and settings access.
 * @param providerId Provider id to log out.
 * @param settings Optional settings adapter for enabled-model cleanup.
 */
export function logoutProvider(
	ctx: ExtensionContext | ExtensionCommandContext,
	providerId: string,
	settings: EnabledModelSettings = SettingsManager.create(ctx.cwd),
): void {
	ctx.modelRegistry.authStorage.logout(providerId);
	removeProviderFromEnabledModels(settings, providerId);
	ctx.modelRegistry.refresh();
}
