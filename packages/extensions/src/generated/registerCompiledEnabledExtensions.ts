import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { applySystemExtensionAvailability } from "@nexus/feature-flags/applySystemExtensionAvailability.js";
import { applyUserExtensionConfig } from "@nexus/feature-flags/applyUserExtensionConfig.js";
import { getBundledFeatureFlagsConfig } from "@nexus/feature-flags/getBundledFeatureFlagsConfig.js";
import { createTelemetryExtensionApi } from "@nexus/feature-flags/createTelemetryExtensionApi.js";
import { setRuntimeExtensionFeatureFlags } from "@nexus/feature-flags/runtimeExtensionFeatureState.js";
import { registerAiProvidersExtension } from "../ai-providers/registerAiProvidersExtension.js";
import { registerAnnotateExtension } from "@nexus/mini-apps/annotate/registerAnnotateExtension.js";
import { registerAutoUpdateExtension } from "../auto-update/registerAutoUpdateExtension.js";
import { registerCmuxExtension } from "../cmux/registerCmuxExtension.js";
import { registerExitMessageExtension } from "../exit-message/registerExitMessageExtension.js";
import { registerExtensionManagerExtension } from "../extension-manager/registerExtensionManagerExtension.js";
import { registerVendorWebsearchExtension } from "../vendor-runtime/registerVendorWebsearchExtension.js";
import { registerAskUserQuestionExtension } from "../ask-user-question/registerAskUserQuestionExtension.js";
import registerFffExtension from "../fff/index.js";
import { registerMdEditorExtension } from "@nexus/mini-apps/md-editor/registerMdEditorExtension.js";
import registerNeoEditorExtension from "../neo-editor/registerNeoEditorExtension.js";
import { registerPromptQueueExtension } from "../prompt-queue/registerPromptQueueExtension.js";
import { registerHotkeysExtension } from "../hotkeys/registerHotkeysExtension.js";
import { registerSlashMenuExtension } from "../slash-menu/registerSlashMenuExtension.js";
import { registerNotifyExtension } from "../notify/registerNotifyExtension.js";
import { registerObservationsExtension } from "../observations/registerObservationsExtension.js";
import { registerPromptsExtension } from "../prompts/registerPromptsExtension.js";
import { registerRtkExtension } from "../rtk/registerRtkExtension.js";
import { registerStartupHeroExtension } from "../startup-hero/registerStartupHeroExtension.js";
import { registerTodoExtension } from "../todo/registerTodoExtension.js";
import registerTronExtension from "../tron/index.js";
import registerSlashusageExtension from "../slashusage/index.js";
import { registerMiniAppManagerExtension } from "@nexus/mini-apps/mini-app-manager/registerMiniAppManagerExtension.js";

/**
 * Extension ids compiled into the release bundle.
 */
export const compiledBundledExtensionIds = [
  "ai-providers",
  "annotate",
  "auto-update",
  "cmux",
  "exit-message",
  "extension-manager",
  "websearch",
  "ask-user-question",
  "fff",
  "md-editor",
  "neo-editor",
  "prompt-queue",
  "hotkeys",
  "slash-menu",
  "notify",
  "observations",
  "prompts",
  "rtk",
  "startup-hero",
  "todo",
  "tron",
  "slashusage",
  "mini-app-manager"
] as const;

const compiledBundledExtensionRegisterMap: Record<string, (pi: ExtensionAPI) => void | Promise<void>> = {
  "ai-providers": registerAiProvidersExtension,
  "annotate": registerAnnotateExtension,
  "auto-update": registerAutoUpdateExtension,
  "cmux": registerCmuxExtension,
  "exit-message": registerExitMessageExtension,
  "extension-manager": registerExtensionManagerExtension,
  "websearch": registerVendorWebsearchExtension,
  "ask-user-question": registerAskUserQuestionExtension,
  "fff": registerFffExtension,
  "md-editor": registerMdEditorExtension,
  "neo-editor": registerNeoEditorExtension,
  "prompt-queue": registerPromptQueueExtension,
  "hotkeys": registerHotkeysExtension,
  "slash-menu": registerSlashMenuExtension,
  "notify": registerNotifyExtension,
  "observations": registerObservationsExtension,
  "prompts": registerPromptsExtension,
  "rtk": registerRtkExtension,
  "startup-hero": registerStartupHeroExtension,
  "todo": registerTodoExtension,
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
