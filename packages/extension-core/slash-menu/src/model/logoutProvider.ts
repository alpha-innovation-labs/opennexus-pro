import type {
	ExtensionCommandContext,
	ExtensionContext,
} from "@earendil-works/pi-coding-agent";
import { SettingsManager } from "@earendil-works/pi-coding-agent";
import {
	type EnabledModelSettings,
	removeProviderFromEnabledModels,
} from "./removeProviderFromEnabledModels";

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
	// Use ModelRegistry API instead of authStorage (which does not exist).
	const status = ctx.modelRegistry.getProviderAuthStatus(providerId);
	if (status?.configured) {
		ctx.modelRegistry.unregisterProvider(providerId);
	}
	removeProviderFromEnabledModels(settings, providerId);
	ctx.modelRegistry.refresh();
}
