import type { ExtensionFactory } from "@earendil-works/pi-coding-agent";
import { hasNoExtensionsFlag } from "../../cli/extensions/hasNoExtensionsFlag.js";

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
  if (hasNoExtensionsFlag(argv)) {
    return [];
  }

  const disabledFeatures = featureOverrides?.disabledFeatures ?? [];
  const enabledFeatures = featureOverrides?.enabledFeatures ?? [];

  return createExtensionFactories([], disabledFeatures, enabledFeatures);
}
