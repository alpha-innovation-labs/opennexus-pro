import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { registerAiProvidersExtension } from "@nexus/extensions/ai-providers/registerAiProvidersExtension.js";
import { registerAnnotateExtension } from "@nexus/mini-apps/annotate/registerAnnotateExtension.js";
import { registerCmuxExtension } from "@nexus/extensions/cmux/registerCmuxExtension.js";
import { registerContextUsageExtension } from "@nexus/extensions/context-usage/registerContextUsageExtension.js";
import { registerDevExtension } from "@nexus/extensions/dev/registerDevExtension.js";
import { registerExitMessageExtension } from "@nexus/extensions/exit-message/registerExitMessageExtension.js";
import { registerExtensionManagerExtension } from "@nexus/extensions/extension-manager/registerExtensionManagerExtension.js";
import { registerFeatureManagementExtension } from "@nexus/extensions/feature-management/registerFeatureManagementExtension.js";
import registerFffExtension from "@nexus/extensions/fff/index.js";
import registerImpeccableExtension from "@nexus/extensions/impeccable/index.js";
import { registerKanbanExtension } from "@nexus/mini-apps/kanban/registerKanbanExtension.js";
import { registerMdEditorExtension } from "@nexus/mini-apps/md-editor/registerMdEditorExtension.js";
import registerNeoEditorExtension from "@nexus/extensions/neo-editor/registerNeoEditorExtension.js";
import { registerMemoryExtension } from "@nexus/mini-apps/memory/registerMemoryExtension.js";
import { registerMiniAppManagerExtension } from "@nexus/mini-apps/mini-app-manager/registerMiniAppManagerExtension.js";
import { registerNotifyExtension } from "@nexus/extensions/notify/registerNotifyExtension.js";
import { registerObservationsExtension } from "@nexus/extensions/observations/registerObservationsExtension.js";
import { registerPlaygroundExtension } from "@nexus/mini-apps/playground/registerPlaygroundExtension.js";
import { registerRtkExtension } from "@nexus/extensions/rtk/registerRtkExtension.js";
import { registerStartupHeroExtension } from "@nexus/extensions/startup-hero/registerStartupHeroExtension.js";
import { registerSmartEvalExtension } from "@nexus/extensions/smart-eval/registerSmartEvalExtension.js";
import registerSubAgentsExtension from "@nexus/extensions/sub-agents/index.js";
import registerSubagentStatusWidgetExtension from "@nexus/extensions/sub-agent-status-widget/registerSubagentStatusWidgetExtension.js";
import { registerTermModalExtension } from "@nexus/mini-apps/term-modal/registerTermModalExtension.js";
import { registerTodoExtension } from "@nexus/mini-apps/todo/registerTodoExtension.js";
import registerTronExtension from "@nexus/extensions/tron/index.js";
import { registerWalletExtension } from "@nexus/mini-apps/wallet/registerWalletExtension.js";
import registerSlashusageExtension from "@nexus/extensions/slashusage/index.js";
import { registerWorkspaceExtension } from "@nexus/mini-apps/workspace/registerWorkspaceExtension.js";
import { registerWorkflowsExtension } from "@nexus/mini-apps/workflows/registerWorkflowsExtension.js";

/**
 * Creates the code-backed extension registration map.
 *
 * @returns Extension registration map by id.
 */
export function createExtensionRegisterMap(): Record<string, (pi: ExtensionAPI) => void | Promise<void>> {
  return {
    "ai-providers": registerAiProvidersExtension,
    annotate: registerAnnotateExtension,
    cmux: registerCmuxExtension,
    "context-usage": registerContextUsageExtension,
    dev: registerDevExtension,
    "extension-manager": registerExtensionManagerExtension,
    "feature-management": registerFeatureManagementExtension,
    fff: registerFffExtension,
    impeccable: registerImpeccableExtension,
    rtk: registerRtkExtension,
    kanban: registerKanbanExtension,
    "md-editor": registerMdEditorExtension,
    "neo-editor": registerNeoEditorExtension,
    memory: registerMemoryExtension,
    "mini-app-manager": registerMiniAppManagerExtension,
    notify: registerNotifyExtension,
    observations: registerObservationsExtension,
    "exit-message": registerExitMessageExtension,
    "startup-hero": registerStartupHeroExtension,
    "smart-eval": registerSmartEvalExtension,
    "sub-agents": registerSubAgentsExtension,
    "sub-agent-status-widget": registerSubagentStatusWidgetExtension,
    playground: registerPlaygroundExtension,
    "term-modal": registerTermModalExtension,
    todo: registerTodoExtension,
    tron: registerTronExtension,
    wallet: registerWalletExtension,
    slashusage: registerSlashusageExtension,
    workspace: registerWorkspaceExtension,
    workflows: registerWorkflowsExtension,
  };
}
