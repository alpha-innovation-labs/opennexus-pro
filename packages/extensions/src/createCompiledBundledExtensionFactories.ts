import type { ExtensionFactory } from "@mariozechner/pi-coding-agent";

/**
 * Creates the release-bundled extension factories compiled from feature-flags.json.
 *
 * @returns The compiled bundled extension factories.
 */
export async function createCompiledBundledExtensionFactories(): Promise<ExtensionFactory[]> {
  const { default: registerCompiledBundledExtensions } = await import("./registerCompiledBundledExtensions.js");

  return [registerCompiledBundledExtensions];
}
