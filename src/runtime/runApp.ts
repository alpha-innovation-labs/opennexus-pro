import { main } from "@mariozechner/pi-coding-agent";
import { createAppArgs } from "../cli/createAppArgs.js";
import { createBundledExtensionFactories } from "../extensions/createBundledExtensionFactories.js";

/**
 * Runs the custom Pi app with the bundled Tron extension.
 *
 * @param argv Raw command line arguments.
 * @returns A promise that resolves when the app exits.
 */
export async function runApp(argv: string[]): Promise<void> {
  const args = createAppArgs(argv);
  const extensionFactories = createBundledExtensionFactories();

  await main(args, { extensionFactories });
}
