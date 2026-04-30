import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { applySystemExtensionAvailability } from "@nexus/feature-flags/applySystemExtensionAvailability.js";
import { applyUserExtensionConfig } from "@nexus/feature-flags/applyUserExtensionConfig.js";
import { getBundledFeatureFlagsConfig } from "@nexus/feature-flags/getBundledFeatureFlagsConfig.js";
import { createTelemetryExtensionApi } from "@nexus/feature-flags/createTelemetryExtensionApi.js";
import { registerAiProvidersExtension } from "../ai-providers/registerAiProvidersExtension.js";
import { registerCmuxExtension } from "../cmux/registerCmuxExtension.js";
import { registerExitMessageExtension } from "../exit-message/registerExitMessageExtension.js";
import { registerExtensionManagerExtension } from "../extension-manager/registerExtensionManagerExtension.js";
import registerFffExtension from "../fff/index.js";
import registerNeoEditorExtension from "../neo-editor/registerNeoEditorExtension.js";
import { registerNotifyExtension } from "../notify/registerNotifyExtension.js";
import { registerRtkExtension } from "../rtk/registerRtkExtension.js";
import { registerStartupHeroExtension } from "../startup-hero/registerStartupHeroExtension.js";
import registerTronExtension from "../tron/index.js";
import registerSlashusageExtension from "../slashusage/index.js";

/**
 * Extension ids compiled into the release bundle.
 */
export const compiledBundledExtensionIds = [
  "ai-providers",
  "cmux",
  "exit-message",
  "extension-manager",
  "fff",
  "neo-editor",
  "notify",
  "rtk",
  "startup-hero",
  "tron",
  "slashusage"
] as const;

const compiledBundledExtensionRegisterMap: Record<string, (pi: ExtensionAPI) => void | Promise<void>> = {
  "ai-providers": registerAiProvidersExtension,
  "cmux": registerCmuxExtension,
  "exit-message": registerExitMessageExtension,
  "extension-manager": registerExtensionManagerExtension,
  "fff": registerFffExtension,
  "neo-editor": registerNeoEditorExtension,
  "notify": registerNotifyExtension,
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
  const config = applySystemExtensionAvailability(applyUserExtensionConfig(getBundledFeatureFlagsConfig()));

  for (const id of compiledBundledExtensionIds) {
    if (!config.extensions[id]?.enabled) continue;
    await compiledBundledExtensionRegisterMap[id]?.(createTelemetryExtensionApi(pi, id));
  }
}
