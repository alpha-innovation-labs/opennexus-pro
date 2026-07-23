import { createBundledExtensionFactories } from "@nexus/extensions/runtime/createBundledExtensionFactories.js";
import { runAppWithExtensionFactories } from "./runAppWithExtensionFactories.js";

/**
 * Runs the bundled Nexus app with inline (source-mode) extensions.
 *
 * This is the single registration path after the feature-flags rewrite:
 * all extensions are hardcoded, user overrides come from config.json,
 * and system checks (cmux) are applied at startup.
 *
 * @param argv Raw command line arguments.
 * @returns A promise that resolves when the app exits.
 */
export async function runBundledApp(argv: string[]): Promise<void> {
  await runAppWithExtensionFactories(argv, createBundledExtensionFactories);
}
