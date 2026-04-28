import type { ExtensionFactory } from "@mariozechner/pi-coding-agent";
import { createAppArgs } from "../cli/createAppArgs.js";
import { resolveBundledExtensionFactories } from "./extensions/resolveBundledExtensionFactories.js";
import { clearStartupProfileLog } from "@nexus/observability/startup-profile/clearStartupProfileLog.js";
import { logStartupProfileEvent } from "@nexus/observability/startup-profile/logStartupProfileEvent.js";
import { clearExitMessage } from "@nexus/extensions/exit-message/state/clearExitMessage.js";
import { applyStartupUpdateSilencePatch } from "@nexus/pi-platform/applyStartupUpdateSilencePatch.js";
import { applyStartupChangelogSilencePatch } from "@nexus/pi-platform/applyStartupChangelogSilencePatch.js";
import { applyToolExecutionSpacingPatch } from "@nexus/pi-platform/applyToolExecutionSpacingPatch.js";
import { applyToolGroupCollapsePatch } from "@nexus/pi-platform/applyToolGroupCollapsePatch.js";
import { applyCompactModeImagePatch } from "@nexus/pi-platform/applyCompactModeImagePatch.js";
import { applyInlineImageOverlayPatch } from "@nexus/pi-platform/inline-image-overlays/applyInlineImageOverlayPatch.js";
import { applyWorkingLoaderElapsedPatch } from "@nexus/pi-platform/applyWorkingLoaderElapsedPatch.js";
import { applyHotkeysCommandPatch } from "@nexus/pi-platform/applyHotkeysCommandPatch.js";
import { applyLoginImportPatch } from "@nexus/pi-platform/login-import/patch/applyLoginImportPatch.js";
import { applyModelKeybindingsPatch } from "@nexus/pi-platform/applyModelKeybindingsPatch.js";
import { applyModelChangeDisplayPatch } from "@nexus/pi-platform/applyModelChangeDisplayPatch.js";
import { applyNexusConfigPatch } from "@nexus/runtime/config/applyNexusConfigPatch.js";
import { ensureEmbeddedPackageDirEnv } from "@nexus/runtime/package/embedded-assets/ensureEmbeddedPackageDirEnv.js";
import { ensureAgentDirEnv } from "@nexus/runtime/config/ensureAgentDirEnv.js";
import { printExitMessage } from "./exit-message/printExitMessage.js";
import { registerExitMessageProcessHandler } from "./exit-message/registerExitMessageProcessHandler.js";
import { extractStartupProfileArgs } from "./startup-profile/extractStartupProfileArgs.js";
import { logRunAppPhase } from "./startup-profile/logRunAppPhase.js";
import { setStartupProfileEnabled } from "./startup-profile/setStartupProfileEnabled.js";
import { normalizeResumeStartupArgs } from "@nexus/runtime/cli/normalizeResumeStartupArgs.js";
import { normalizeUsageStartupArgs } from "@nexus/runtime/cli/normalizeUsageStartupArgs.js";
import { pruneLoggedOutEnabledModels } from "@nexus/pi-platform/settings/pruneLoggedOutEnabledModels.js";
import { clearStartupScreen } from "./startup-screen/clearStartupScreen.js";
import { shouldClearStartupScreen } from "./startup-screen/shouldClearStartupScreen.js";
import { ensureAnnotationsDaemonStarted } from "./annotations-daemon/ensureAnnotationsDaemonStarted.js";

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
  const rawArgs = normalizeUsageStartupArgs(normalizeResumeStartupArgs(extractedArgs));
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
  await ensureAnnotationsDaemonStarted();
  logRunAppPhase("ensureAnnotationsDaemonStarted:done", phaseStartedAt);

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
  applyModelChangeDisplayPatch();
  logRunAppPhase("applyModelChangeDisplayPatch:done", phaseStartedAt);

  phaseStartedAt = performance.now();
  applyHotkeysCommandPatch();
  logRunAppPhase("applyHotkeysCommandPatch:done", phaseStartedAt);

  phaseStartedAt = performance.now();
  await applyLoginImportPatch();
  logRunAppPhase("applyLoginImportPatch:done", phaseStartedAt);

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
  applyWorkingLoaderElapsedPatch();
  logRunAppPhase("applyWorkingLoaderElapsedPatch:done", phaseStartedAt);

  phaseStartedAt = performance.now();
  await pruneLoggedOutEnabledModels(process.cwd());
  logRunAppPhase("pruneLoggedOutEnabledModels:done", phaseStartedAt);

  phaseStartedAt = performance.now();
  const args = createAppArgs(rawArgs);
  const extensionFactories = await resolveBundledExtensionFactories(rawArgs, createExtensionFactories);
  logRunAppPhase("prepareArgsAndExtensions:done", phaseStartedAt);

  phaseStartedAt = performance.now();
  const { main } = await import("@mariozechner/pi-coding-agent");
  applyModelChangeDisplayPatch();
  logRunAppPhase("importPiMain:done", phaseStartedAt);

  phaseStartedAt = performance.now();
  await main(args, { extensionFactories });
  logRunAppPhase("piMain:done", phaseStartedAt);

  printExitMessage();
}
