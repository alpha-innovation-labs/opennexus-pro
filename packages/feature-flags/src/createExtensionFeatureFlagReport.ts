import type { ExtensionFeatureFlag } from "./types";

/**
 * Builds a readable report of extension flags and their features.
 *
 * @param flags Full extension registry.
 * @returns Multiline extension feature report.
 */
export function createExtensionFeatureFlagReport(
	flags: ExtensionFeatureFlag[],
): string {
	return flags
		.map((flag) => {
			const status = flag.enabled ? "enabled" : "disabled";
			return [
				`- ${flag.id}: ${status}`,
				...flag.features.map((feature) => `  - ${feature}`),
			].join("\n");
		})
		.join("\n");
}
