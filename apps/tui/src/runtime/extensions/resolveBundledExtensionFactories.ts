import type { ExtensionFactory } from "@mariozechner/pi-coding-agent";
import { hasNoExtensionsFlag } from "../../cli/extensions/hasNoExtensionsFlag.js";
import { hasPrintModeFlag } from "../../cli/print/hasPrintModeFlag.js";

export type CreateExtensionFactories = () => Promise<ExtensionFactory[]>;

/**
 * Resolves bundled extension factories for the current argv.
 *
 * @param argv Raw command-line arguments.
 * @param createExtensionFactories Factory provider for bundled extensions.
 * @returns Bundled extension factories when argv keeps extensions enabled.
 */
export async function resolveBundledExtensionFactories(
  argv: string[],
  createExtensionFactories: CreateExtensionFactories,
): Promise<ExtensionFactory[]> {
  if (hasNoExtensionsFlag(argv) || hasPrintModeFlag(argv)) {
    return [];
  }

  return createExtensionFactories();
}
