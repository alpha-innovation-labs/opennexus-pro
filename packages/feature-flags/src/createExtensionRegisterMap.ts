import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { registerAiProvidersExtension } from "@nexus/extensions/ai-providers/registerAiProvidersExtension.js";
import { registerAnnotateExtension } from "@nexus/mini-apps/annotate/registerAnnotateExtension.js";
import { registerAutoUpdateExtension } from "@nexus/extensions/auto-update/registerAutoUpdateExtension.js";
import { registerCmuxExtension } from "@nexus/extensions/cmux/registerCmuxExtension.js";
import { registerContextUsageExtension } from "@nexus/extensions/context-usage/registerContextUsageExtension.js";
import { registerDevExtension } from "@nexus/extensions/dev/registerDevExtension.js";
import { registerExitMessageExtension } from "@nexus/extensions/exit-message/registerExitMessageExtension.js";
import { registerExtensionManagerExtension } from "@nexus/extensions/extension-manager/registerExtensionManagerExtension.js";
import { registerFeatureManagementExtension } from "@nexus/extensions/feature-management/registerFeatureManagementExtension.js";
import registerFffExtension from "@nexus/extensions/fff/index.js";
import { registerKanbanExtension } from "@nexus/mini-apps/kanban/registerKanbanExtension.js";
import { registerMdEditorExtension } from "@nexus/mini-apps/md-editor/registerMdEditorExtension.js";
import registerNeoEditorExtension from "@nexus/extensions/neo-editor/registerNeoEditorExtension.js";
import { registerHotkeysExtension } from "@nexus/extensions/hotkeys/registerHotkeysExtension.js";
import { registerSlashMenuExtension } from "@nexus/extensions/slash-menu/registerSlashMenuExtension.js";
import { registerMemoryExtension } from "@nexus/mini-apps/memory/registerMemoryExtension.js";
import { registerMiniAppManagerExtension } from "@nexus/mini-apps/mini-app-manager/registerMiniAppManagerExtension.js";
import { registerNotifyExtension } from "@nexus/extensions/notify/registerNotifyExtension.js";
import { registerObservationsExtension } from "@nexus/extensions/observations/registerObservationsExtension.js";
import { registerOhMyPiLspExtension } from "@nexus/extensions/oh-my-pi-lsp/registerOhMyPiLspExtension.js";
import { registerPlaygroundExtension } from "@nexus/mini-apps/playground/registerPlaygroundExtension.js";
import { registerPromptsExtension } from "@nexus/extensions/prompts/registerPromptsExtension.js";
import { registerPromptQueueExtension } from "@nexus/extensions/prompt-queue/registerPromptQueueExtension.js";
import { registerRtkExtension } from "@nexus/extensions/rtk/registerRtkExtension.js";
import { registerStartupHeroExtension } from "@nexus/extensions/startup-hero/registerStartupHeroExtension.js";
import { registerSmartEvalExtension } from "@nexus/extensions/smart-eval/registerSmartEvalExtension.js";
import registerSubAgentsExtension from "@nexus/extensions/sub-agents/index.js";
import registerSubagentStatusWidgetExtension from "@nexus/extensions/sub-agent-status-widget/registerSubagentStatusWidgetExtension.js";
import { registerTermModalExtension } from "@nexus/mini-apps/term-modal/registerTermModalExtension.js";
import { registerTetrisExtension } from "@nexus/mini-apps/tetris/registerTetrisExtension.js";
import { registerTodoExtension } from "@nexus/extensions/todo/registerTodoExtension.js";
import registerTronExtension from "@nexus/extensions/tron/index.js";
import { registerWalletExtension } from "@nexus/mini-apps/wallet/registerWalletExtension.js";
import registerSlashusageExtension from "@nexus/extensions/slashusage/index.js";
import { registerWorkspaceExtension } from "@nexus/mini-apps/workspace/registerWorkspaceExtension.js";
import { registerWorkflowsExtension } from "@nexus/mini-apps/workflows/registerWorkflowsExtension.js";
import { registerVendorMcpAdapterExtension } from "@nexus/extensions/vendor-runtime/registerVendorMcpAdapterExtension.js";
import { registerVendorPiLensExtension } from "@nexus/extensions/vendor-runtime/registerVendorPiLensExtension.js";
import { registerAskUserQuestionExtension } from "@nexus/extensions/ask-user-question/registerAskUserQuestionExtension.js";
import { registerVendorWebsearchExtension } from "@nexus/extensions/vendor-runtime/registerVendorWebsearchExtension.js";

/**
 * Creates the code-backed extension registration map.
 *
 * @returns Extension registration map by id.
 */
export function createExtensionRegisterMap(): Record<
	string,
	(pi: ExtensionAPI) => void | Promise<void>
> {
	return {
		"ai-providers": registerAiProvidersExtension,
		annotate: registerAnnotateExtension,
		"auto-update": registerAutoUpdateExtension,
		cmux: registerCmuxExtension,
		"context-usage": registerContextUsageExtension,
		dev: registerDevExtension,
		"extension-manager": registerExtensionManagerExtension,
		"feature-management": registerFeatureManagementExtension,
		fff: registerFffExtension,
		rtk: registerRtkExtension,
		kanban: registerKanbanExtension,
		"md-editor": registerMdEditorExtension,
		"neo-editor": registerNeoEditorExtension,
		"hotkeys": registerHotkeysExtension,
		"slash-menu": registerSlashMenuExtension,
		memory: registerMemoryExtension,
		"mini-app-manager": registerMiniAppManagerExtension,
		notify: registerNotifyExtension,
		observations: registerObservationsExtension,
		"oh-my-pi-lsp": registerOhMyPiLspExtension,
		prompts: registerPromptsExtension,
		"prompt-queue": registerPromptQueueExtension,
		"exit-message": registerExitMessageExtension,
		"startup-hero": registerStartupHeroExtension,
		"smart-eval": registerSmartEvalExtension,
		"sub-agents": registerSubAgentsExtension,
		"sub-agent-status-widget": registerSubagentStatusWidgetExtension,
		playground: registerPlaygroundExtension,
		"term-modal": registerTermModalExtension,
		tetris: registerTetrisExtension,
		todo: registerTodoExtension,
		tron: registerTronExtension,
		wallet: registerWalletExtension,
		slashusage: registerSlashusageExtension,
		workspace: registerWorkspaceExtension,
		workflows: registerWorkflowsExtension,
		websearch: registerVendorWebsearchExtension,
		"mcp-adapter": registerVendorMcpAdapterExtension,
		"ask-user-question": registerAskUserQuestionExtension,
		"pi-lens": registerVendorPiLensExtension,
	};
}
