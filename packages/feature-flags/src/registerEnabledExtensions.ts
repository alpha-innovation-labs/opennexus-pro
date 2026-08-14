import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { createExtensionRegistrationTask } from "./createExtensionRegistrationTask";
import { getEnabledExtensionFeatureFlags } from "./getEnabledExtensionFeatureFlags";
import { setRuntimeExtensionFeatureFlags } from "./runtimeExtensionFeatureState";
import type { ExtensionFeatureFlag } from "./types";

/**
 * Registers only the enabled extensions from the feature-flag registry.
 *
 * @param pi Pi extension API.
 * @param flags Full extension registry.
 * @param skipExtensions Optional list of extension IDs to skip registration.
 */
export async function registerEnabledExtensions(
	pi: ExtensionAPI,
	flags: ExtensionFeatureFlag[],
	skipExtensions?: string[],
): Promise<void> {
	setRuntimeExtensionFeatureFlags(flags);
	const enabledFlags = getEnabledExtensionFeatureFlags(flags);
	const filteredFlags = skipExtensions
		? enabledFlags.filter((flag) => !skipExtensions.includes(flag.id))
		: enabledFlags;

	// Pre-compute counts for extensions that need them (e.g., startup-hero).
	const knownMiniApps = new Set(["tetris"]);
	let extCount = 0;
	let miniCount = 0;
	for (const flag of filteredFlags) {
		if (knownMiniApps.has(flag.id)) {
			miniCount++;
		} else {
			extCount++;
		}
	}
	const counts = {
		enabledExtensionCount: extCount,
		enabledMiniAppCount: miniCount,
	};

	await Promise.all(
		filteredFlags.map((flag) => createExtensionRegistrationTask(pi, flag, counts)),
	);
}
