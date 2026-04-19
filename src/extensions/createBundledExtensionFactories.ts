import type { ExtensionFactory } from "@mariozechner/pi-coding-agent";
import registerBundledExtensions from "./index.js";

/**
 * Creates the inline extension factories bundled with this app.
 *
 * @returns The bundled extension factories.
 */
export function createBundledExtensionFactories(): ExtensionFactory[] {
  return [registerBundledExtensions];
}
