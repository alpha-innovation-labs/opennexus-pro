import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { createExtensionRegistrationTask } from "./createExtensionRegistrationTask.js";
import { getEnabledExtensionFeatureFlags } from "./getEnabledExtensionFeatureFlags.js";
import { setRuntimeExtensionFeatureFlags } from "./runtimeExtensionFeatureState.js";
import type { ExtensionFeatureFlag } from "./types.js";

/**
 * Registers only the enabled extensions from the feature-flag registry.
 *
 * @param pi Pi extension API.
 * @param flags Full extension registry.
 */
export async function registerEnabledExtensions(pi: ExtensionAPI, flags: ExtensionFeatureFlag[]): Promise<void> {
	setRuntimeExtensionFeatureFlags(flags);
	await Promise.all(getEnabledExtensionFeatureFlags(flags).map((flag) => createExtensionRegistrationTask(pi, flag)));
}
