import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { registerAnnotateExtension } from "../extensions/annotate/registerAnnotateExtension.js";
import { registerCmuxExtension } from "../extensions/cmux/registerCmuxExtension.js";
import { registerContextUsageExtension } from "../extensions/context-usage/registerContextUsageExtension.js";
import { registerDevExtension } from "../extensions/dev/registerDevExtension.js";
import { registerExitMessageExtension } from "../extensions/exit-message/registerExitMessageExtension.js";
import { registerFeatureManagementExtension } from "../extensions/feature-management/registerFeatureManagementExtension.js";
import registerFffExtension from "../extensions/fff/index.js";
import { registerKanbanExtension } from "../extensions/kanban/registerKanbanExtension.js";
import { registerMdEditorExtension } from "../extensions/md-editor/registerMdEditorExtension.js";
import registerNeoEditorExtension from "../extensions/neo-editor/registerNeoEditorExtension.js";
import { registerNotifyExtension } from "../extensions/notify/registerNotifyExtension.js";
import { registerObservationsExtension } from "../extensions/observations/registerObservationsExtension.js";
import { registerPlaygroundExtension } from "../extensions/playground/registerPlaygroundExtension.js";
import { registerRtkExtension } from "../extensions/rtk/registerRtkExtension.js";
import { registerStartupLogoExtension } from "../extensions/startup-logo/registerStartupLogoExtension.js";
import registerSubAgentsExtension from "../extensions/sub-agents/index.js";
import registerSubagentStatusWidgetExtension from "../extensions/sub-agent-status-widget/registerSubagentStatusWidgetExtension.js";
import { registerTermModalExtension } from "../extensions/term-modal/registerTermModalExtension.js";
import { registerTodoExtension } from "../extensions/todo/registerTodoExtension.js";
import registerTronExtension from "../extensions/tron/index.js";
import { registerWorkspaceExtension } from "../extensions/workspace/registerWorkspaceExtension.js";
import { registerWorkflowsExtension } from "../extensions/workflows/registerWorkflowsExtension.js";

/**
 * Creates the code-backed extension registration map.
 *
 * @returns Extension registration map by id.
 */
export function createExtensionRegisterMap(): Record<string, (pi: ExtensionAPI) => void> {
  return {
    annotate: registerAnnotateExtension,
    cmux: registerCmuxExtension,
    "context-usage": registerContextUsageExtension,
    dev: registerDevExtension,
    "feature-management": registerFeatureManagementExtension,
    fff: registerFffExtension,
    rtk: registerRtkExtension,
    kanban: registerKanbanExtension,
    "md-editor": registerMdEditorExtension,
    "neo-editor": registerNeoEditorExtension,
    notify: registerNotifyExtension,
    observations: registerObservationsExtension,
    "exit-message": registerExitMessageExtension,
    "startup-logo": registerStartupLogoExtension,
    "sub-agents": registerSubAgentsExtension,
    "sub-agent-status-widget": registerSubagentStatusWidgetExtension,
    playground: registerPlaygroundExtension,
    "term-modal": registerTermModalExtension,
    todo: registerTodoExtension,
    tron: registerTronExtension,
    workspace: registerWorkspaceExtension,
    workflows: registerWorkflowsExtension,
  };
}
