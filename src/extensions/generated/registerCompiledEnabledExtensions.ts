import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { applySystemExtensionAvailability } from "../../feature-flags/applySystemExtensionAvailability.js";
import { getBundledFeatureFlagsConfig } from "../../feature-flags/getBundledFeatureFlagsConfig.js";
import { registerCmuxExtension } from "../cmux/registerCmuxExtension.js";
import { registerExitMessageExtension } from "../exit-message/registerExitMessageExtension.js";
import { registerCompiledFeatureManagementExtension } from "../feature-management/registerCompiledFeatureManagementExtension.js";
import registerFffExtension from "../fff/index.js";
import registerNeoEditorExtension from "../neo-editor/registerNeoEditorExtension.js";
import { registerNotifyExtension } from "../notify/registerNotifyExtension.js";
import { registerObservationsExtension } from "../observations/registerObservationsExtension.js";
import { registerRtkExtension } from "../rtk/registerRtkExtension.js";
import { registerStartupLogoExtension } from "../startup-logo/registerStartupLogoExtension.js";
import registerSubagentStatusWidgetExtension from "../sub-agent-status-widget/registerSubagentStatusWidgetExtension.js";
import registerSubAgentsExtension from "../sub-agents/index.js";
import registerTronExtension from "../tron/index.js";

/**
 * Extension ids compiled into the release bundle.
 */
export const compiledBundledExtensionIds = [
  "cmux",
  "exit-message",
  "feature-management",
  "fff",
  "neo-editor",
  "notify",
  "observations",
  "rtk",
  "startup-logo",
  "sub-agent-status-widget",
  "sub-agents",
  "tron"
] as const;

const compiledBundledExtensionRegisterMap: Record<string, (pi: ExtensionAPI) => void> = {
  "cmux": registerCmuxExtension,
  "exit-message": registerExitMessageExtension,
  "feature-management": registerCompiledFeatureManagementExtension,
  "fff": registerFffExtension,
  "neo-editor": registerNeoEditorExtension,
  "notify": registerNotifyExtension,
  "observations": registerObservationsExtension,
  "rtk": registerRtkExtension,
  "startup-logo": registerStartupLogoExtension,
  "sub-agent-status-widget": registerSubagentStatusWidgetExtension,
  "sub-agents": registerSubAgentsExtension,
  "tron": registerTronExtension,
};

/**
 * Registers only extensions compiled into the release bundle that remain enabled at runtime.
 *
 * @param pi Pi extension API.
 */
export default function registerCompiledEnabledExtensions(pi: ExtensionAPI): void {
  const config = applySystemExtensionAvailability(getBundledFeatureFlagsConfig());

  for (const id of compiledBundledExtensionIds) {
    if (!config.extensions[id]?.enabled) continue;
    compiledBundledExtensionRegisterMap[id]?.(pi);
  }
}
