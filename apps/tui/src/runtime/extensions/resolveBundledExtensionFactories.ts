import type { ExtensionFactory } from "@earendil-works/pi-coding-agent";
import { getAllBundledExtensionIds } from "@nexus/feature-flags/registry";
import { hasNoExtensionsFlag } from "../../cli/extensions/hasNoExtensionsFlag";

export type CreateExtensionFactories = (
	skipExtensions?: string[],
	disabledFeatures?: string[],
	enabledFeatures?: string[],
) => Promise<ExtensionFactory[]>;

export interface FeatureOverrides {
	disabledFeatures?: string[];
	enabledFeatures?: string[];
}

/**
 * Resolves bundled extension factories for the current argv.
 *
 * @param argv Raw command-line arguments.
 * @param createExtensionFactories Factory provider for bundled extensions.
 * @param featureOverrides Optional CLI-level feature flag overrides.
 * @returns Bundled extension factories when argv keeps extensions enabled.
 */
export async function resolveBundledExtensionFactories(
	argv: string[],
	createExtensionFactories: CreateExtensionFactories,
	featureOverrides?: FeatureOverrides,
): Promise<ExtensionFactory[]> {
	const disabledFeatures = featureOverrides?.disabledFeatures ?? [];
	const enabledFeatures = featureOverrides?.enabledFeatures ?? [];

	if (hasNoExtensionsFlag(argv)) {
		const allIds = getAllBundledExtensionIds();
		const skipIds =
			enabledFeatures.length > 0
				? allIds.filter((id) => !enabledFeatures.includes(id))
				: allIds;
		return createExtensionFactories(skipIds, disabledFeatures, enabledFeatures);
	}

	return createExtensionFactories([], disabledFeatures, enabledFeatures);
}
