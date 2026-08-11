import { isCmuxCommandAvailable } from "@extensions/cmux/runtime/isCmuxCommandAvailable";
import type { ExtensionFeatureFlag } from "./types";

/**
 * Applies runtime extension availability overrides for the current system.
 *
 * Currently only checks whether the `cmux` command is available on the host.
 * If cmux is unavailable, the cmux extension is disabled.
 *
 * @param flags Extension feature flags to apply system checks to.
 * @returns Flags with system-level availability applied.
 */
export function applySystemExtensionAvailability(
	flags: ExtensionFeatureFlag[],
): ExtensionFeatureFlag[] {
	const cmuxAvailable = isCmuxCommandAvailable();

	return flags.map((flag) => {
		const isCmux = flag.id === "cmux";
		const available = isCmux ? cmuxAvailable : true;
		return {
			...flag,
			enabled: flag.enabled && available,
		};
	});
}
