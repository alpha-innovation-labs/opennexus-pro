import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { applySystemExtensionAvailability } from "@nexus/feature-flags/applySystemExtensionAvailability.js";
import { getBundledFeatureFlagsConfig } from "@nexus/feature-flags/getBundledFeatureFlagsConfig.js";
import { registerAiProvidersExtension } from "../ai-providers/registerAiProvidersExtension.js";
import { registerAnnotateExtension } from "../annotate/registerAnnotateExtension.js";
import { registerCmuxExtension } from "../cmux/registerCmuxExtension.js";
import { registerExitMessageExtension } from "../exit-message/registerExitMessageExtension.js";
import { registerCompiledFeatureManagementExtension } from "../feature-management/registerCompiledFeatureManagementExtension.js";
import registerFffExtension from "../fff/index.js";
import registerNeoEditorExtension from "../neo-editor/registerNeoEditorExtension.js";
import { registerNotifyExtension } from "../notify/registerNotifyExtension.js";
import { registerObservationsExtension } from "../observations/registerObservationsExtension.js";
import { registerRtkExtension } from "../rtk/registerRtkExtension.js";
import { registerStartupHeroExtension } from "../startup-hero/registerStartupHeroExtension.js";
import registerTronExtension from "../tron/index.js";
import registerSlashusageExtension from "../slashusage/index.js";

/**
 * Extension ids compiled into the release bundle.
 */
export const compiledBundledExtensionIds = [
  "ai-providers",
  "annotate",
  "cmux",
  "exit-message",
  "feature-management",
  "fff",
  "neo-editor",
  "notify",
  "observations",
  "rtk",
  "startup-hero",
  "tron",
  "slashusage"
] as const;

const compiledBundledExtensionRegisterMap: Record<string, (pi: ExtensionAPI) => void | Promise<void>> = {
  "ai-providers": registerAiProvidersExtension,
  "annotate": registerAnnotateExtension,
  "cmux": registerCmuxExtension,
  "exit-message": registerExitMessageExtension,
  "feature-management": registerCompiledFeatureManagementExtension,
  "fff": registerFffExtension,
  "neo-editor": registerNeoEditorExtension,
  "notify": registerNotifyExtension,
  "observations": registerObservationsExtension,
  "rtk": registerRtkExtension,
  "startup-hero": registerStartupHeroExtension,
  "tron": registerTronExtension,
  "slashusage": registerSlashusageExtension,
};

/**
 * Registers only extensions compiled into the release bundle that remain enabled at runtime.
 *
 * @param pi Pi extension API.
 */
export default async function registerCompiledEnabledExtensions(pi: ExtensionAPI): Promise<void> {
  const config = applySystemExtensionAvailability(getBundledFeatureFlagsConfig());

  for (const id of compiledBundledExtensionIds) {
    if (!config.extensions[id]?.enabled) continue;
    await compiledBundledExtensionRegisterMap[id]?.(pi);
  }
}
