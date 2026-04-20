import { createAppArgs } from "../cli/createAppArgs.js";
import { createBundledExtensionFactories } from "../extensions/createBundledExtensionFactories.js";
import { clearExitMessage } from "../extensions/exit-message/state/clearExitMessage.js";
import { applyStartupUpdateSilencePatch } from "../pi-internals/applyStartupUpdateSilencePatch.js";
import { applyToolExecutionSpacingPatch } from "../pi-internals/applyToolExecutionSpacingPatch.js";
import { applyNexusConfigPatch } from "./config/applyNexusConfigPatch.js";
import { ensureAgentDirEnv } from "./config/ensureAgentDirEnv.js";
import { printExitMessage } from "./exit-message/printExitMessage.js";
import { registerExitMessageProcessHandler } from "./exit-message/registerExitMessageProcessHandler.js";

/**
 * Runs the custom Pi app with the bundled Tron extension.
 *
 * @param argv Raw command line arguments.
 * @returns A promise that resolves when the app exits.
 */
export async function runApp(argv: string[]): Promise<void> {
  clearExitMessage();
  registerExitMessageProcessHandler();
  ensureAgentDirEnv();
  await applyNexusConfigPatch();
  applyStartupUpdateSilencePatch();
  applyToolExecutionSpacingPatch();
  const args = createAppArgs(argv);
  const extensionFactories = createBundledExtensionFactories();
  const { main } = await import("@mariozechner/pi-coding-agent");

  await main(args, { extensionFactories });
  printExitMessage();
}
