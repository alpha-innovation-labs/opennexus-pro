import { clearExitMessage } from "@extensions/exit-message";
import { startupStartedAtEnvVar } from "@extensions/startup-hero";
import { clearStartupProfileLog } from "@nexus/observability";
import type { ExtensionAPI, ExtensionFactory } from "@earendil-works/pi-coding-agent";
import {
	clearHotkeysCommandHook,
} from "@extensions/hotkeys";
import {
	clearRegisteredSlashCommands,
	registerSlashCommand,
} from "@extensions/slash-menu";
import { createTronToolWrappingExtensionApi } from "@extensions/tron";
import { clearRegisteredToolRecords } from "@extensions/shared";
import {
	createExtensionFeatureFlags,
	getEnabledExtensionFeatureFlags,
	setRuntimeExtensionFeatureFlags,
} from "@nexus/feature-flags";
import { recordRegisteredShortcut } from "@nexus/tui-kit";
import { applyHotkeysCommandPatch } from "@nexus/pi-platform";
import { applyModelChangeDisplayPatch } from "@nexus/pi-platform";
import { applyStartupChangelogSilencePatch } from "@nexus/pi-platform";
import { applyStartupHelpSilencePatch } from "@nexus/pi-platform";
import { applyStartupUpdateSilencePatch } from "@nexus/pi-platform";
import { applyToolExecutionSpacingPatch } from "@nexus/pi-platform";
import { applyWorkingLoaderElapsedPatch } from "@nexus/pi-platform";
import { applyInlineImageOverlayPatch } from "@nexus/pi-platform";
import { applyPromptTemplateArgAppendPatch } from "@nexus/pi-platform";
import { pruneLoggedOutEnabledModels } from "@nexus/pi-platform";
import { applyNexusSystemPromptPatch } from "@nexus/pi-platform";
import { normalizeResumeStartupArgs } from "@nexus/runtime";
import { normalizeUsageStartupArgs } from "@nexus/runtime";
import { applyNexusConfigPatch } from "@nexus/runtime";
import { copyBundledThemes } from "@nexus/runtime";
import { getNexusAgentDirPath } from "@nexus/runtime";
import { ensureEmbeddedPackageDirEnv } from "@nexus/runtime";
import { createAppArgs } from "../cli/createAppArgs";
import { stripFeatureFlags } from "../cli/features/hasFeaturesFlag";
import { printExitMessage } from "./exit-message/printExitMessage";
import { registerExitMessageProcessHandler } from "./exit-message/registerExitMessageProcessHandler";
import { resolveBundledExtensionFactories } from "./extensions/resolveBundledExtensionFactories";
import { extractStartupProfileArgs } from "./startup-profile/extractStartupProfileArgs";
import { logRunAppPhase } from "./startup-profile/logRunAppPhase";
import { setStartupProfileEnabled } from "./startup-profile/setStartupProfileEnabled";
import { clearStartupScreen } from "./startup-screen/clearStartupScreen";
import { shouldClearStartupScreen } from "./startup-screen/shouldClearStartupScreen";

/**
 * Runs the bundled Nexus app with inline (source-mode) extensions.
 *
 * This is the single app entry point for both dev and release modes:
 * all extensions are hardcoded, user overrides come from config.json,
 * and system checks (cmux) are applied at startup.
 *
 * @param argv Raw command line arguments.
 * @param featureOverrides Optional CLI-level feature flag overrides.
 * @returns A promise that resolves when the app exits.
 */
export async function runApp(
  argv: string[],
  featureOverrides?: {
    disabledFeatures?: string[];
    enabledFeatures?: string[];
  },
): Promise<void> {
  const { args: extractedArgs, startupProfileEnabled } =
    extractStartupProfileArgs(argv);
  const rawArgs = normalizeUsageStartupArgs(
    normalizeResumeStartupArgs(extractedArgs),
  );
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
  applyInlineImageOverlayPatch();
  logRunAppPhase("applyInlineImageOverlayPatch:done", phaseStartedAt);

  phaseStartedAt = performance.now();
  applyWorkingLoaderElapsedPatch();
  logRunAppPhase("applyWorkingLoaderElapsedPatch:done", phaseStartedAt);

  phaseStartedAt = performance.now();
  await pruneLoggedOutEnabledModels(process.cwd());
  logRunAppPhase("pruneLoggedOutEnabledModels:done", phaseStartedAt);

  phaseStartedAt = performance.now();
  const strippedArgs = stripFeatureFlags(rawArgs);
  const args = createAppArgs(strippedArgs);
  logRunAppPhase("createAppArgs:done", phaseStartedAt);

  phaseStartedAt = performance.now();
  const extensionFactories = await resolveBundledExtensionFactories(
    rawArgs,
    createBundledExtensionFactories,
    featureOverrides,
  );
  logRunAppPhase("resolveBundledExtensionFactories:done", phaseStartedAt);

  // Inline bundled extension registration (moved from @extensions/runtime).
  async function registerBundledExtensions(
    pi: ExtensionAPI,
    skipExtensions?: string[],
    disabledFeatures?: string[],
    enabledFeatures?: string[],
  ): Promise<void> {
    clearRegisteredToolRecords();

    const cliDisabled = new Set(disabledFeatures ?? []);
    const cliEnabled = new Set(enabledFeatures ?? []);

    const standardFlags = createExtensionFeatureFlags();

    const cliFlags = standardFlags.map((flag) => {
      if (cliDisabled.has(flag.id)) {
        return { ...flag, enabled: false };
      }
      if (cliEnabled.has(flag.id)) {
        return { ...flag, enabled: true };
      }
      return flag;
    });

    const isTronEnabled = cliFlags.some(
      (flag) => flag.id === "tron" && flag.enabled,
    );
    const isSlashMenuEnabled = cliFlags.some(
      (flag) => flag.id === "slash-menu" && flag.enabled,
    );
    if (!cliFlags.some((flag) => flag.id === "hotkeys" && flag.enabled))
      clearHotkeysCommandHook();
    if (!isSlashMenuEnabled) clearRegisteredSlashCommands();
    const toolAwarePi = isTronEnabled
      ? createTronToolWrappingExtensionApi(pi)
      : pi;
    const slashAwarePi = new Proxy(toolAwarePi, {
      get(target, property, receiver) {
        if (property === "registerCommand") {
          return (name: string, definition: Record<string, unknown>) => {
            if (isSlashMenuEnabled)
              registerSlashCommand({
                name,
                description:
                  typeof definition.description === "string"
                    ? definition.description
                    : undefined,
                source: "extension",
                menuGroup:
                  typeof definition.menuGroup === "string"
                    ? definition.menuGroup
                    : undefined,
                handler:
                  typeof definition.handler === "function"
                    ? (definition.handler as never)
                    : undefined,
              });
            return target.registerCommand(name, definition as never);
          };
        }
        if (property === "registerShortcut") {
          return (shortcut: string, definition: Record<string, unknown>) => {
            recordRegisteredShortcut(shortcut, definition);
            return target.registerShortcut(
              shortcut as never,
              definition as never,
            );
          };
        }
        return Reflect.get(target, property, receiver);
      },
    });

    setRuntimeExtensionFeatureFlags(cliFlags);

    const enabledFlags = getEnabledExtensionFeatureFlags(cliFlags);
    const filteredFlags = skipExtensions
      ? enabledFlags.filter((flag) => !skipExtensions.includes(flag.id))
      : enabledFlags;
    const { createExtensionRegistrationTask } = await import(
      "@nexus/feature-flags"
    );
    await Promise.all(
      filteredFlags.map((flag) =>
        createExtensionRegistrationTask(slashAwarePi, flag),
      ),
    );
  }

  async function createBundledExtensionFactories(
    skipExtensions?: string[],
    disabledFeatures?: string[],
    enabledFeatures?: string[],
  ): Promise<ExtensionFactory[]> {
    const startedAt = performance.now();
    const wrapped = (pi: Parameters<typeof registerBundledExtensions>[0]) =>
      registerBundledExtensions(
        pi,
        skipExtensions,
        disabledFeatures,
        enabledFeatures,
      );
    logStartupProfileEvent("extensions", "importBundledExtensions:done", {
      durationMs: Number((performance.now() - startedAt).toFixed(3)),
    });
    return [wrapped];
  }
  logStartupProfileEvent("runApp", "prepareArgsAndExtensions:done");

  phaseStartedAt = performance.now();
  const piModule = await import("@earendil-works/pi-coding-agent");
  applyModelChangeDisplayPatch();
  logRunAppPhase("importPiMain:done", phaseStartedAt);

  phaseStartedAt = performance.now();
  await piModule.main(args, { extensionFactories: extensionFactories });
  logRunAppPhase("piMain:done", phaseStartedAt);

  printExitMessage();
}
