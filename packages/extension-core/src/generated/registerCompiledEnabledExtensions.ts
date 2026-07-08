import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { applySystemExtensionAvailability } from "@nexus/feature-flags/applySystemExtensionAvailability.js";
import { applyUserExtensionConfig } from "@nexus/feature-flags/applyUserExtensionConfig.js";
import { getBundledFeatureFlagsConfig } from "@nexus/feature-flags/getBundledFeatureFlagsConfig.js";
import { createTelemetryExtensionApi } from "@nexus/feature-flags/createTelemetryExtensionApi.js";
import { setRuntimeExtensionFeatureFlags } from "@nexus/feature-flags/runtimeExtensionFeatureState.js";
import { registerAutoUpdateExtension } from "../auto-update/registerAutoUpdateExtension.js";
import { registerCmuxExtension } from "@nexus/extensions-pro/cmux/registerCmuxExtension.js";
import { registerContextUsageExtension } from "../context-usage/registerContextUsageExtension.js";
import { registerExitMessageExtension } from "../exit-message/registerExitMessageExtension.js";
import { registerPiPackagesExtension } from "../pi-packages/registerPiPackagesExtension.js";
import registerFffExtension from "../fff/index.js";
import registerNeoEditorExtension from "../neo-editor/registerNeoEditorExtension.js";
import { registerPromptQueueExtension } from "../prompt-queue/registerPromptQueueExtension.js";
import { registerSteerQueueExtension } from "../steer-queue/registerSteerQueueExtension.js";
import { registerHotkeysExtension } from "../hotkeys/registerHotkeysExtension.js";
import { registerSlashMenuExtension } from "../slash-menu/registerSlashMenuExtension.js";
import { registerNotifyExtension } from "../notify/registerNotifyExtension.js";
import { registerObservationsExtension } from "@nexus/extensions-pro/observations/registerObservationsExtension.js";
import { registerSystemPromptExtension } from "../system-prompt/registerSystemPromptExtension.js";
import { registerRtkExtension } from "@nexus/extensions-pro/rtk/registerRtkExtension.js";
import { registerStartupHeroExtension } from "../startup-hero/registerStartupHeroExtension.js";
import { registerTetrisExtension } from "@nexus/mini-apps/tetris/registerTetrisExtension.js";
import registerTronExtension from "../tron/index.js";
import registerSlashusageExtension from "../slashusage/index.js";
import { registerMiniAppManagerExtension } from "@nexus/mini-apps/mini-app-manager/registerMiniAppManagerExtension.js";

/**
 * Extension ids compiled into the release bundle.
 */
export const compiledBundledExtensionIds = [
  "auto-update",
  "cmux",
  "context-usage",
  "exit-message",
  "pi-packages",
  "fff",
  "neo-editor",
  "prompt-queue",
  "steer-queue",
  "hotkeys",
  "slash-menu",
  "notify",
  "observations",
  "system-prompt",
  "rtk",
  "startup-hero",
  "tetris",
  "tron",
  "slashusage",
  "mini-app-manager"
] as const;

const compiledBundledExtensionRegisterMap: Record<string, (pi: ExtensionAPI) => void | Promise<void>> = {
  "auto-update": registerAutoUpdateExtension,
  "cmux": registerCmuxExtension,
  "context-usage": registerContextUsageExtension,
  "exit-message": registerExitMessageExtension,
  "pi-packages": registerPiPackagesExtension,
  "fff": registerFffExtension,
  "neo-editor": registerNeoEditorExtension,
  "prompt-queue": registerPromptQueueExtension,
  "steer-queue": registerSteerQueueExtension,
  "hotkeys": registerHotkeysExtension,
  "slash-menu": registerSlashMenuExtension,
  "notify": registerNotifyExtension,
  "observations": registerObservationsExtension,
  "system-prompt": registerSystemPromptExtension,
  "rtk": registerRtkExtension,
  "startup-hero": registerStartupHeroExtension,
  "tetris": registerTetrisExtension,
  "tron": registerTronExtension,
  "slashusage": registerSlashusageExtension,
  "mini-app-manager": registerMiniAppManagerExtension,
};

/**
 * Registers only extensions compiled into the release bundle that remain enabled at runtime.
 *
 * @param pi Pi extension API.
 */
export default async function registerCompiledEnabledExtensions(pi: ExtensionAPI): Promise<void> {
  const config = applySystemExtensionAvailability(applyUserExtensionConfig(getBundledFeatureFlagsConfig()));
  setRuntimeExtensionFeatureFlags(compiledBundledExtensionIds.map((id) => ({ id, enabled: Boolean(config.extensions[id]?.enabled ?? config.other?.[id]?.enabled) })));

  for (const id of compiledBundledExtensionIds) {
    if (!(config.extensions[id]?.enabled ?? config.other?.[id]?.enabled)) continue;
    await compiledBundledExtensionRegisterMap[id]?.(createTelemetryExtensionApi(pi, id));
  }
}
