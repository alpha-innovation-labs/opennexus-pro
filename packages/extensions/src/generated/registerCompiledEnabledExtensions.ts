import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { applySystemExtensionAvailability } from "@nexus/feature-flags/applySystemExtensionAvailability.js";
import { applyUserExtensionConfig } from "@nexus/feature-flags/applyUserExtensionConfig.js";
import { getBundledFeatureFlagsConfig } from "@nexus/feature-flags/getBundledFeatureFlagsConfig.js";
import { createTelemetryExtensionApi } from "@nexus/feature-flags/createTelemetryExtensionApi.js";
import { registerAiProvidersExtension } from "../ai-providers/registerAiProvidersExtension.js";
import { registerCmuxExtension } from "../cmux/registerCmuxExtension.js";
import { registerExitMessageExtension } from "../exit-message/registerExitMessageExtension.js";
import { registerExtensionManagerExtension } from "../extension-manager/registerExtensionManagerExtension.js";
import { registerVendorWebsearchExtension } from "../vendor-runtime/registerVendorWebsearchExtension.js";
import { registerVendorMcpAdapterExtension } from "../vendor-runtime/registerVendorMcpAdapterExtension.js";
import { registerVendorRpivTodoExtension } from "../vendor-runtime/registerVendorRpivTodoExtension.js";
import { registerVendorRpivAskUserQuestionExtension } from "../vendor-runtime/registerVendorRpivAskUserQuestionExtension.js";
import { registerOhMyPiLspExtension } from "../oh-my-pi-lsp/registerOhMyPiLspExtension.js";
import registerFffExtension from "../fff/index.js";
import { registerMdEditorExtension } from "@nexus/mini-apps/md-editor/registerMdEditorExtension.js";
import registerNeoEditorExtension from "../neo-editor/registerNeoEditorExtension.js";
import { registerMemoryExtension } from "@nexus/mini-apps/memory/registerMemoryExtension.js";
import { registerNotifyExtension } from "../notify/registerNotifyExtension.js";
import { registerObservationsExtension } from "../observations/registerObservationsExtension.js";
import { registerPromptsExtension } from "../prompts/registerPromptsExtension.js";
import { registerRtkExtension } from "../rtk/registerRtkExtension.js";
import { registerStartupHeroExtension } from "../startup-hero/registerStartupHeroExtension.js";
import registerTronExtension from "../tron/index.js";
import registerSlashusageExtension from "../slashusage/index.js";
import { registerMiniAppManagerExtension } from "@nexus/mini-apps/mini-app-manager/registerMiniAppManagerExtension.js";

/**
 * Extension ids compiled into the release bundle.
 */
export const compiledBundledExtensionIds = [
  "ai-providers",
  "cmux",
  "exit-message",
  "extension-manager",
  "websearch",
  "mcp-adapter",
  "rpiv-todo",
  "rpiv-ask-user-question",
  "oh-my-pi-lsp",
  "fff",
  "md-editor",
  "neo-editor",
  "memory",
  "notify",
  "observations",
  "prompts",
  "rtk",
  "startup-hero",
  "tron",
  "slashusage",
  "mini-app-manager"
] as const;

const compiledBundledExtensionRegisterMap: Record<string, (pi: ExtensionAPI) => void | Promise<void>> = {
  "ai-providers": registerAiProvidersExtension,
  "cmux": registerCmuxExtension,
  "exit-message": registerExitMessageExtension,
  "extension-manager": registerExtensionManagerExtension,
  "websearch": registerVendorWebsearchExtension,
  "mcp-adapter": registerVendorMcpAdapterExtension,
  "rpiv-todo": registerVendorRpivTodoExtension,
  "rpiv-ask-user-question": registerVendorRpivAskUserQuestionExtension,
  "oh-my-pi-lsp": registerOhMyPiLspExtension,
  "fff": registerFffExtension,
  "md-editor": registerMdEditorExtension,
  "neo-editor": registerNeoEditorExtension,
  "memory": registerMemoryExtension,
  "notify": registerNotifyExtension,
  "observations": registerObservationsExtension,
  "prompts": registerPromptsExtension,
  "rtk": registerRtkExtension,
  "startup-hero": registerStartupHeroExtension,
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

  for (const id of compiledBundledExtensionIds) {
    if (!(config.extensions[id]?.enabled ?? config.other?.[id]?.enabled)) continue;
    await compiledBundledExtensionRegisterMap[id]?.(createTelemetryExtensionApi(pi, id));
  }
}
