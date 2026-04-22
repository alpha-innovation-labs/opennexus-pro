import type { ExtensionFactory } from "@mariozechner/pi-coding-agent";

/**
 * Creates the inline extension factories bundled with this app.
 *
 * @returns The bundled extension factories.
 */
export async function createBundledExtensionFactories(): Promise<ExtensionFactory[]> {
  const { default: registerBundledExtensions } = await import("./index.js");

  return [registerBundledExtensions];
}
