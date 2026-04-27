import type { ExtensionFactory } from "@mariozechner/pi-coding-agent";
import { createAppArgs } from "../cli/createAppArgs.js";
import { resolveBundledExtensionFactories } from "./extensions/resolveBundledExtensionFactories.js";
import { clearStartupProfileLog } from "../extensions/shared/observability/startup-profile/clearStartupProfileLog.js";
import { logStartupProfileEvent } from "../extensions/shared/observability/startup-profile/logStartupProfileEvent.js";
import { clearExitMessage } from "../extensions/exit-message/state/clearExitMessage.js";
import { applyStartupUpdateSilencePatch } from "../pi-internals/applyStartupUpdateSilencePatch.js";
import { applyStartupChangelogSilencePatch } from "../pi-internals/applyStartupChangelogSilencePatch.js";
import { applyToolExecutionSpacingPatch } from "../pi-internals/applyToolExecutionSpacingPatch.js";
import { applyToolGroupCollapsePatch } from "../pi-internals/applyToolGroupCollapsePatch.js";
import { applyCompactModeImagePatch } from "../pi-internals/applyCompactModeImagePatch.js";
import { applyInlineImageOverlayPatch } from "../pi-internals/inline-image-overlays/applyInlineImageOverlayPatch.js";
import { applyModelKeybindingsPatch } from "../pi-internals/applyModelKeybindingsPatch.js";
import { applyNexusConfigPatch } from "./config/applyNexusConfigPatch.js";
import { ensureEmbeddedPackageDirEnv } from "./package/embedded-assets/ensureEmbeddedPackageDirEnv.js";
import { ensureAgentDirEnv } from "./config/ensureAgentDirEnv.js";
import { printExitMessage } from "./exit-message/printExitMessage.js";
import { registerExitMessageProcessHandler } from "./exit-message/registerExitMessageProcessHandler.js";
import { extractStartupProfileArgs } from "./startup-profile/extractStartupProfileArgs.js";
import { logRunAppPhase } from "./startup-profile/logRunAppPhase.js";
import { setStartupProfileEnabled } from "./startup-profile/setStartupProfileEnabled.js";
import { normalizeResumeStartupArgs } from "./cli/normalizeResumeStartupArgs.js";
import { clearStartupScreen } from "./startup-screen/clearStartupScreen.js";
import { shouldClearStartupScreen } from "./startup-screen/shouldClearStartupScreen.js";

export type CreateExtensionFactories = () => Promise<ExtensionFactory[]>;

/**
 * Runs Nexus with the supplied extension-factory provider.
 *
 * @param argv Raw command line arguments.
 * @param createExtensionFactories Factory provider for the current runtime mode.
 * @returns A promise that resolves when the app exits.
 */
export async function runAppWithExtensionFactories(
  argv: string[],
  createExtensionFactories: CreateExtensionFactories,
): Promise<void> {
  const { args: extractedArgs, startupProfileEnabled } = extractStartupProfileArgs(argv);
  const rawArgs = normalizeResumeStartupArgs(extractedArgs);
  setStartupProfileEnabled(startupProfileEnabled);
  if (shouldClearStartupScreen(rawArgs, process.stdin, process.stdout)) {
    clearStartupScreen(process.stdout);
  }
  clearStartupProfileLog();
  clearExitMessage();
  registerExitMessageProcessHandler();
  logStartupProfileEvent("runApp", "start", { argv: rawArgs });

  let phaseStartedAt = performance.now();
  ensureAgentDirEnv();
  logRunAppPhase("ensureAgentDirEnv:done", phaseStartedAt);

  phaseStartedAt = performance.now();
  await ensureEmbeddedPackageDirEnv();
  logRunAppPhase("ensureEmbeddedPackageDirEnv:done", phaseStartedAt);

  phaseStartedAt = performance.now();
  await applyNexusConfigPatch();
  logRunAppPhase("applyNexusConfigPatch:done", phaseStartedAt);

  phaseStartedAt = performance.now();
  applyStartupUpdateSilencePatch();
  logRunAppPhase("applyStartupUpdateSilencePatch:done", phaseStartedAt);

  phaseStartedAt = performance.now();
  applyStartupChangelogSilencePatch();
  logRunAppPhase("applyStartupChangelogSilencePatch:done", phaseStartedAt);

  phaseStartedAt = performance.now();
  applyModelKeybindingsPatch();
  logRunAppPhase("applyModelKeybindingsPatch:done", phaseStartedAt);

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
  applyInlineImageOverlayPatch();
  logRunAppPhase("applyInlineImageOverlayPatch:done", phaseStartedAt);

  phaseStartedAt = performance.now();
  const args = createAppArgs(rawArgs);
  const extensionFactories = await resolveBundledExtensionFactories(rawArgs, createExtensionFactories);
  logRunAppPhase("prepareArgsAndExtensions:done", phaseStartedAt);

  phaseStartedAt = performance.now();
  const { main } = await import("@mariozechner/pi-coding-agent");
  logRunAppPhase("importPiMain:done", phaseStartedAt);

  phaseStartedAt = performance.now();
  await main(args, { extensionFactories });
  logRunAppPhase("piMain:done", phaseStartedAt);

  printExitMessage();
}
