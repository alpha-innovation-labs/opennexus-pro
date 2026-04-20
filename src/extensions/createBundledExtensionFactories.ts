import type { ExtensionFactory } from "@mariozechner/pi-coding-agent";
import registerBundledExtensions from "./index.js";

const DISABLE_BUNDLED_EXTENSIONS_ENV = "NEXUS_DISABLE_BUNDLED_EXTENSIONS";

/**
 * Creates the inline extension factories bundled with this app.
 *
 * @returns The bundled extension factories.
 */
export function createBundledExtensionFactories(): ExtensionFactory[] {
  if (process.env[DISABLE_BUNDLED_EXTENSIONS_ENV] === "1") {
    return [];
  }

  return [registerBundledExtensions];
}
