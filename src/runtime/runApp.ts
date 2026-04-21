import { createAppArgs } from "../cli/createAppArgs.js";
import { clearStartupProfileLog } from "../extensions/shared/observability/startup-profile/clearStartupProfileLog.js";
import { logStartupProfileEvent } from "../extensions/shared/observability/startup-profile/logStartupProfileEvent.js";
import { createBundledExtensionFactories } from "../extensions/createBundledExtensionFactories.js";
import { clearExitMessage } from "../extensions/exit-message/state/clearExitMessage.js";
import { applyStartupUpdateSilencePatch } from "../pi-internals/applyStartupUpdateSilencePatch.js";
import { applyToolExecutionSpacingPatch } from "../pi-internals/applyToolExecutionSpacingPatch.js";
import { applyToolGroupCollapsePatch } from "../pi-internals/applyToolGroupCollapsePatch.js";
import { applyCompactModeImagePatch } from "../pi-internals/applyCompactModeImagePatch.js";
import { applyNexusConfigPatch } from "./config/applyNexusConfigPatch.js";
import { ensureAgentDirEnv } from "./config/ensureAgentDirEnv.js";
import { printExitMessage } from "./exit-message/printExitMessage.js";
import { registerExitMessageProcessHandler } from "./exit-message/registerExitMessageProcessHandler.js";
import { extractStartupProfileArgs } from "./startup-profile/extractStartupProfileArgs.js";
import { logRunAppPhase } from "./startup-profile/logRunAppPhase.js";
import { setStartupProfileEnabled } from "./startup-profile/setStartupProfileEnabled.js";

/**
 * Runs the custom Pi app with the bundled Tron extension.
 *
 * @param argv Raw command line arguments.
 * @returns A promise that resolves when the app exits.
 */
export async function runApp(argv: string[]): Promise<void> {
  const { args: rawArgs, startupProfileEnabled } = extractStartupProfileArgs(argv);
  setStartupProfileEnabled(startupProfileEnabled);
  clearStartupProfileLog();
  clearExitMessage();
  registerExitMessageProcessHandler();
  logStartupProfileEvent("runApp", "start", { argv: rawArgs });

  let phaseStartedAt = performance.now();
  ensureAgentDirEnv();
  logRunAppPhase("ensureAgentDirEnv:done", phaseStartedAt);

  phaseStartedAt = performance.now();
  await applyNexusConfigPatch();
  logRunAppPhase("applyNexusConfigPatch:done", phaseStartedAt);

  phaseStartedAt = performance.now();
  applyStartupUpdateSilencePatch();
  logRunAppPhase("applyStartupUpdateSilencePatch:done", phaseStartedAt);

  phaseStartedAt = performance.now();
  applyToolExecutionSpacingPatch();
  logRunAppPhase("applyToolExecutionSpacingPatch:done", phaseStartedAt);

  phaseStartedAt = performance.now();
  applyToolGroupCollapsePatch();
  logRunAppPhase("applyToolGroupCollapsePatch:done", phaseStartedAt);

  phaseStartedAt = performance.now();
  applyCompactModeImagePatch();
  logRunAppPhase("applyCompactModeImagePatch:done", phaseStartedAt);

  phaseStartedAt = performance.now();
  const args = createAppArgs(rawArgs);
  const extensionFactories = createBundledExtensionFactories();
  logRunAppPhase("prepareArgsAndExtensions:done", phaseStartedAt);

  phaseStartedAt = performance.now();
  const { main } = await import("@mariozechner/pi-coding-agent");
  logRunAppPhase("importPiMain:done", phaseStartedAt);

  phaseStartedAt = performance.now();
  await main(args, { extensionFactories });
  logRunAppPhase("piMain:done", phaseStartedAt);

  printExitMessage();
}
