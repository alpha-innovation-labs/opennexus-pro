import { createBundledExtensionFactories } from "@nexus/extensions/runtime/createBundledExtensionFactories.js";
import { createAppArgs } from "../cli/createAppArgs.js";
import { resolveBundledExtensionFactories } from "./extensions/resolveBundledExtensionFactories.js";
import { clearStartupProfileLog } from "@nexus/observability/startup-profile/clearStartupProfileLog.js";
import { logStartupProfileEvent } from "@nexus/observability/startup-profile/logStartupProfileEvent.js";
import { clearExitMessage } from "@nexus/extensions/exit-message/state/clearExitMessage.js";
import { applyStartupUpdateSilencePatch } from "@nexus/pi-platform/applyStartupUpdateSilencePatch.js";
import { applyStartupChangelogSilencePatch } from "@nexus/pi-platform/applyStartupChangelogSilencePatch.js";
import { applyStartupHelpSilencePatch } from "@nexus/pi-platform/applyStartupHelpSilencePatch.js";
import { applyToolExecutionSpacingPatch } from "@nexus/pi-platform/applyToolExecutionSpacingPatch.js";
import { applyToolGroupCollapsePatch } from "@nexus/pi-platform/applyToolGroupCollapsePatch.js";
import { applyCompactModeImagePatch } from "@nexus/pi-platform/applyCompactModeImagePatch.js";
import { applyInlineImageOverlayPatch } from "@nexus/pi-platform/inline-image-overlays/applyInlineImageOverlayPatch.js";
import { applyWorkingLoaderElapsedPatch } from "@nexus/pi-platform/applyWorkingLoaderElapsedPatch.js";
import { applyHotkeysCommandPatch } from "@nexus/pi-platform/applyHotkeysCommandPatch.js";
import { applyNexusSystemPromptPatch } from "@nexus/pi-platform/system-prompt/applyNexusSystemPromptPatch.js";
import { applyPromptTemplateArgAppendPatch } from "@nexus/pi-platform/prompt-templates/applyPromptTemplateArgAppendPatch.js";
import { applyModelChangeDisplayPatch } from "@nexus/pi-platform/applyModelChangeDisplayPatch.js";
import { copyBundledThemes } from "@nexus/runtime/config/copyBundledThemes.js";
import { applyNexusConfigPatch } from "@nexus/runtime/config/applyNexusConfigPatch.js";
import { ensureEmbeddedPackageDirEnv } from "@nexus/runtime/package/embedded-assets/ensureEmbeddedPackageDirEnv.js";
import { getNexusAgentDirPath } from "@nexus/runtime/config/getNexusAgentDirPath.js";
import { printExitMessage } from "./exit-message/printExitMessage.js";
import { registerExitMessageProcessHandler } from "./exit-message/registerExitMessageProcessHandler.js";
import { extractStartupProfileArgs } from "./startup-profile/extractStartupProfileArgs.js";
import { logRunAppPhase } from "./startup-profile/logRunAppPhase.js";
import { setStartupProfileEnabled } from "./startup-profile/setStartupProfileEnabled.js";
import { normalizeResumeStartupArgs } from "@nexus/runtime/cli/normalizeResumeStartupArgs.js";
import { normalizeUsageStartupArgs } from "@nexus/runtime/cli/normalizeUsageStartupArgs.js";
import { startupStartedAtEnvVar } from "@nexus/extensions/startup-hero/startupStartedAtEnvVar.js";
import { pruneLoggedOutEnabledModels } from "@nexus/pi-platform/settings/pruneLoggedOutEnabledModels.js";
import { clearStartupScreen } from "./startup-screen/clearStartupScreen.js";
import { shouldClearStartupScreen } from "./startup-screen/shouldClearStartupScreen.js";

/**
 * Runs the bundled Nexus app with inline (source-mode) extensions.
 *
 * This is the single app entry point for both dev and release modes:
 * all extensions are hardcoded, user overrides come from config.json,
 * and system checks (cmux) are applied at startup.
 *
 * @param argv Raw command line arguments.
 * @returns A promise that resolves when the app exits.
 */
export async function runApp(argv: string[]): Promise<void> {
  const { args: extractedArgs, startupProfileEnabled } = extractStartupProfileArgs(argv);
  const rawArgs = normalizeUsageStartupArgs(normalizeResumeStartupArgs(extractedArgs));
  setStartupProfileEnabled(startupProfileEnabled);
  if (shouldClearStartupScreen(rawArgs, process.stdin, process.stdout)) {
    clearStartupScreen(process.stdout);
  }
  clearStartupProfileLog();
  clearExitMessage();
  registerExitMessageProcessHandler();
  const appStartedAt = performance.now();
  process.env[startupStartedAtEnvVar] = String(appStartedAt);
  logStartupProfileEvent("runApp", "start", { argv: rawArgs });

  let phaseStartedAt = performance.now();
  await copyBundledThemes();
  logRunAppPhase("copyBundledThemes:done", phaseStartedAt);

  phaseStartedAt = performance.now();
  await applyNexusConfigPatch();
  logRunAppPhase("applyNexusConfigPatch:done", phaseStartedAt);

  phaseStartedAt = performance.now();
  getNexusAgentDirPath();
  logRunAppPhase("getNexusAgentDirPath:done", phaseStartedAt);

  phaseStartedAt = performance.now();
  await ensureEmbeddedPackageDirEnv();
  logRunAppPhase("ensureEmbeddedPackageDirEnv:done", phaseStartedAt);

  phaseStartedAt = performance.now();
  applyStartupUpdateSilencePatch();
  logRunAppPhase("applyStartupUpdateSilencePatch:done", phaseStartedAt);

  phaseStartedAt = performance.now();
  applyStartupChangelogSilencePatch();
  logRunAppPhase("applyStartupChangelogSilencePatch:done", phaseStartedAt);

  phaseStartedAt = performance.now();
  await applyStartupHelpSilencePatch();
  logRunAppPhase("applyStartupHelpSilencePatch:done", phaseStartedAt);

  phaseStartedAt = performance.now();
  await applyPromptTemplateArgAppendPatch();
  logRunAppPhase("applyPromptTemplateArgAppendPatch:done", phaseStartedAt);

  phaseStartedAt = performance.now();
  applyModelChangeDisplayPatch();
  logRunAppPhase("applyModelChangeDisplayPatch:done", phaseStartedAt);

  phaseStartedAt = performance.now();
  applyHotkeysCommandPatch();
  logRunAppPhase("applyHotkeysCommandPatch:done", phaseStartedAt);

  phaseStartedAt = performance.now();
  await applyNexusSystemPromptPatch();
  logRunAppPhase("applyNexusSystemPromptPatch:done", phaseStartedAt);

  phaseStartedAt = performance.now();
  applyToolExecutionSpacingPatch();
  logRunAppPhase("applyToolExecutionSpacingPatch:done", phaseStartedAt);

  phaseStartedAt = performance.now();
  await applyToolGroupCollapsePatch();
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
  logRunAppPhase("createAppArgs:done", phaseStartedAt);

  phaseStartedAt = performance.now();
  const extensionFactories = await resolveBundledExtensionFactories(
    rawArgs,
    createBundledExtensionFactories,
  );
  logRunAppPhase("resolveBundledExtensionFactories:done", phaseStartedAt);
  logStartupProfileEvent("runApp", "prepareArgsAndExtensions:done");

  phaseStartedAt = performance.now();
  const { main } = await import("@earendil-works/pi-coding-agent");
  applyModelChangeDisplayPatch();
  logRunAppPhase("importPiMain:done", phaseStartedAt);

  phaseStartedAt = performance.now();
  await main(args, { extensionFactories });
  logRunAppPhase("piMain:done", phaseStartedAt);

  printExitMessage();
}
