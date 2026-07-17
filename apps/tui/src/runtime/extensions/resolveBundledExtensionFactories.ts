import type { ExtensionAPI, ExtensionFactory } from "@earendil-works/pi-coding-agent";
import { hasNoExtensionsFlag } from "../../cli/extensions/hasNoExtensionsFlag.js";
import { hasPrintModeFlag } from "../../cli/print/hasPrintModeFlag.js";

export type CreateExtensionFactories = () => Promise<ExtensionFactory[]>;

/**
 * Resolves bundled extension factories for the current argv.
 *
 * In print mode (-p), skips the ai-providers extension to avoid blocking
 * network requests during provider credential prompts.
 *
 * @param argv Raw command-line arguments.
 * @param createExtensionFactories Factory provider for bundled extensions.
 * @returns Bundled extension factories when argv keeps extensions enabled.
 */
export async function resolveBundledExtensionFactories(
  argv: string[],
  createExtensionFactories: CreateExtensionFactories,
): Promise<ExtensionFactory[]> {
  if (hasNoExtensionsFlag(argv)) {
    return [];
  }

  const factories = await createExtensionFactories();
  const isPrintMode = hasPrintModeFlag(argv);

  // In print mode, skip ai-providers to avoid blocking network requests
  // during cursor model discovery. All other extensions (including webtools)
  // remain available.
  if (isPrintMode) {
    const skipExtensions = ["ai-providers"];
    return factories.map((factory) => {
      const originalFactory = factory as (pi: ExtensionAPI, skipExtensions?: string[]) => Promise<void>;
      return async (pi: ExtensionAPI) => {
        // Pass skipExtensions to factory if it supports the signature
        await originalFactory(pi, skipExtensions);
      };
    });
  }

  return factories;
}
