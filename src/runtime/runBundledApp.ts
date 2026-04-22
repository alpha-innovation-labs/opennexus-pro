import { createCompiledBundledExtensionFactories } from "../extensions/createCompiledBundledExtensionFactories.js";
import { runAppWithExtensionFactories } from "./runAppWithExtensionFactories.js";

/**
 * Runs the release-bundled Nexus app with compile-time-selected extensions.
 *
 * @param argv Raw command line arguments.
 * @returns A promise that resolves when the app exits.
 */
export async function runBundledApp(argv: string[]): Promise<void> {
  await runAppWithExtensionFactories(argv, createCompiledBundledExtensionFactories);
}
