import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { applySystemExtensionAvailability } from "../../feature-flags/applySystemExtensionAvailability.js";
import { getBundledFeatureFlagsConfig } from "../../feature-flags/getBundledFeatureFlagsConfig.js";
import { registerAnnotateExtension } from "../annotate/registerAnnotateExtension.js";
import { registerCmuxExtension } from "../cmux/registerCmuxExtension.js";
import { registerContextUsageExtension } from "../context-usage/registerContextUsageExtension.js";
import { registerClipboardImagePasteExtension } from "../clipboard-image-paste/registerClipboardImagePasteExtension.js";
import registerFffExtension from "../fff/index.js";
import { registerKanbanExtension } from "../kanban/registerKanbanExtension.js";
import registerNeoEditorExtension from "../neo-editor/registerNeoEditorExtension.js";
import { registerObservationsExtension } from "../observations/registerObservationsExtension.js";
import { registerNotifyExtension } from "../notify/registerNotifyExtension.js";
import { registerExitMessageExtension } from "../exit-message/registerExitMessageExtension.js";
import { registerStartupLogoExtension } from "../startup-logo/registerStartupLogoExtension.js";
import registerSubAgentsExtension from "../sub-agents/index.js";
import registerSubagentStatusWidgetExtension from "../sub-agent-status-widget/registerSubagentStatusWidgetExtension.js";
import registerTronExtension from "../tron/index.js";
import { registerTermModalExtension } from "../term-modal/registerTermModalExtension.js";
import { registerTodoExtension } from "../todo/registerTodoExtension.js";
import { registerPlaygroundExtension } from "../playground/registerPlaygroundExtension.js";
import { registerWorkspaceExtension } from "../workspace/registerWorkspaceExtension.js";

/**
 * Extension ids compiled into the release bundle.
 */
export const compiledBundledExtensionIds = [
  "annotate",
  "cmux",
  "context-usage",
  "clipboard-image-paste",
  "fff",
  "kanban",
  "neo-editor",
  "observations",
  "notify",
  "exit-message",
  "startup-logo",
  "sub-agents",
  "sub-agent-status-widget",
  "tron",
  "term-modal",
  "todo",
  "playground",
  "workspace"
] as const;

const compiledBundledExtensionRegisterMap: Record<string, (pi: ExtensionAPI) => void> = {
  "annotate": registerAnnotateExtension,
  "cmux": registerCmuxExtension,
  "context-usage": registerContextUsageExtension,
  "clipboard-image-paste": registerClipboardImagePasteExtension,
  "fff": registerFffExtension,
  "kanban": registerKanbanExtension,
  "neo-editor": registerNeoEditorExtension,
  "observations": registerObservationsExtension,
  "notify": registerNotifyExtension,
  "exit-message": registerExitMessageExtension,
  "startup-logo": registerStartupLogoExtension,
  "sub-agents": registerSubAgentsExtension,
  "sub-agent-status-widget": registerSubagentStatusWidgetExtension,
  "tron": registerTronExtension,
  "term-modal": registerTermModalExtension,
  "todo": registerTodoExtension,
  "playground": registerPlaygroundExtension,
  "workspace": registerWorkspaceExtension,
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
