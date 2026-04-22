import { createBundledExtensionFactories } from "../extensions/createBundledExtensionFactories.js";
import { runAppWithExtensionFactories } from "./runAppWithExtensionFactories.js";

/**
 * Runs Nexus with the source-mode bundled extension factory set.
 *
 * @param argv Raw command line arguments.
 * @returns A promise that resolves when the app exits.
 */
export async function runApp(argv: string[]): Promise<void> {
  await runAppWithExtensionFactories(argv, createBundledExtensionFactories);
}
