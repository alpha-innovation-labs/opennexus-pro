import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { readNexusUserConfig } from "@nexus/runtime/config/readNexusUserConfig.js";
import { registerAiProvidersExtension } from "@nexus/extensions/ai-providers/registerAiProvidersExtension.js";
import { registerAnnotateExtension } from "@nexus/mini-apps/annotate/registerAnnotateExtension.js";
import { registerAutomationsExtension } from "@nexus/mini-apps/automations/registerAutomationsExtension.js";
import { registerAutoUpdateExtension } from "@nexus/extensions/auto-update/registerAutoUpdateExtension.js";
import { registerCmuxExtension } from "@nexus/extensions-pro/cmux/registerCmuxExtension.js";
import { registerContextUsageExtension } from "@nexus/extensions/context-usage/registerContextUsageExtension.js";
import { registerChatStatusExtension } from "@nexus/extensions/chat-status/registerChatStatusExtension.js";
import { registerDevExtension } from "@nexus/extensions-dev/dev/registerDevExtension.js";
import { registerExitMessageExtension } from "@nexus/extensions/exit-message/registerExitMessageExtension.js";
import { registerHerdrAgentEndLogExtension } from "@nexus/extensions/herdr-agent-end-log/registerHerdrAgentEndLogExtension.js";
import { registerPiPackagesExtension } from "@nexus/extensions/pi-packages/registerPiPackagesExtension.js";
import { registerFeatureManagementExtension } from "@nexus/extensions-dev/feature-management/registerFeatureManagementExtension.js";
import registerFffExtension from "@nexus/extensions/fff/index.js";
import { registerMdEditorExtension } from "@nexus/mini-apps/md-editor/registerMdEditorExtension.js";
import registerNeoEditorExtension from "@nexus/extensions/neo-editor/registerNeoEditorExtension.js";
import { registerHotkeysExtension } from "@nexus/extensions/hotkeys/registerHotkeysExtension.js";
import { registerSlashMenuExtension } from "@nexus/extensions/slash-menu/registerSlashMenuExtension.js";
import { registerMiniAppManagerExtension } from "@nexus/mini-apps/mini-app-manager/registerMiniAppManagerExtension.js";
import { registerNotifyExtension } from "@nexus/extensions/notify/registerNotifyExtension.js";
import { registerObservationsExtension } from "@nexus/extensions-pro/observations/registerObservationsExtension.js";
import { registerSystemPromptExtension } from "@nexus/extensions/system-prompt/registerSystemPromptExtension.js";
import { registerRtkExtension } from "@nexus/extensions-pro/rtk/registerRtkExtension.js";
import { registerStartupHeroExtension } from "@nexus/extensions/startup-hero/registerStartupHeroExtension.js";
import { registerTetrisExtension } from "@nexus/mini-apps/tetris/registerTetrisExtension.js";
import { registerTodoExtension } from "@nexus/extensions-dev/todo/registerTodoExtension.js";
import registerTronExtension from "@nexus/extensions/tron/index.js";
import { registerWalletExtension } from "@nexus/mini-apps/wallet/registerWalletExtension.js";
import { registerWebSearchExtension } from "@nexus/extensions/web-search/registerWebSearchExtension.js";
import registerLocalImageReaderExtension from "@nexus/extensions/local-image-reader/registerLocalImageReaderExtension.js";

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
		automations: registerAutomationsExtension,
		"auto-update": registerAutoUpdateExtension,
		cmux: registerCmuxExtension,
		"context-usage": registerContextUsageExtension,
		"chat-status": registerChatStatusExtension,
		dev: registerDevExtension,
		"pi-packages": registerPiPackagesExtension,
		"feature-management": registerFeatureManagementExtension,
		fff: registerFffExtension,
		rtk: registerRtkExtension,
		"md-editor": registerMdEditorExtension,
		"neo-editor": registerNeoEditorExtension,
		"hotkeys": registerHotkeysExtension,
		"slash-menu": registerSlashMenuExtension,
		"mini-app-manager": registerMiniAppManagerExtension,
		notify: (pi: ExtensionAPI) => {
			const userConfig = readNexusUserConfig();
			if (userConfig.notifyEnabled === false) return;
			registerNotifyExtension(pi);
		},
		observations: registerObservationsExtension,
		"system-prompt": registerSystemPromptExtension,
		"exit-message": registerExitMessageExtension,
		"herdr-agent-end-log": registerHerdrAgentEndLogExtension,
		"startup-hero": registerStartupHeroExtension,
		tetris: registerTetrisExtension,
		todo: registerTodoExtension,
		tron: registerTronExtension,
		wallet: registerWalletExtension,
		webtools: registerWebSearchExtension,
		"local-image-reader": registerLocalImageReaderExtension,
	};
}
