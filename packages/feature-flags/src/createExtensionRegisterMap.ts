import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { registerAiProvidersExtension } from "@extensions/ai-providers/register-ai-providers/registerAiProvidersExtension.js";
import { registerAutoUpdateExtension } from "@extensions/auto-update/registerAutoUpdateExtension.js";
import { registerCmuxExtension } from "@extensions/cmux/registerCmuxExtension.js";
import { registerContextUsageExtension } from "@extensions/context-usage/registerContextUsageExtension.js";
import { registerExitMessageExtension } from "@extensions/exit-message/registerExitMessageExtension.js";
import { registerFeatureManagementExtension } from "@extensions/feature-management/registerFeatureManagementExtension.js";
import registerFffExtension from "@extensions/fff/index.js";
import registerNeoEditorExtension from "@extensions/neo-editor/registerNeoEditorExtension.js";
import { registerHotkeysExtension } from "@extensions/hotkeys/registerHotkeysExtension.js";
import { registerSlashMenuExtension } from "@extensions/slash-menu/registerSlashMenuExtension.js";
import { registerMiniAppManagerExtension } from "@nexus/mini-apps/mini-app-manager/registerMiniAppManagerExtension.js";
import { registerNotifyExtension } from "@extensions/notify/registerNotifyExtension.js";
import { registerObservationsExtension } from "@extensions/observations/registerObservationsExtension.js";
import { registerSystemPromptExtension } from "@extensions/system-prompt/registerSystemPromptExtension.js";
import { registerRtkExtension } from "@extensions/rtk/registerRtkExtension.js";
import { registerStartupHeroExtension } from "@extensions/startup-hero/registerStartupHeroExtension.js";
import { registerTetrisExtension } from "@nexus/mini-apps/tetris/registerTetrisExtension.js";

import registerTronExtension from "@extensions/tron/index.js";
import { registerWebSearchExtension } from "@extensions/web-search/registerWebSearchExtension.js";
import registerLocalImageReaderExtension from "@extensions/local-image-reader/registerLocalImageReaderExtension.js";
import { registerSubagentsExtension } from "@extensions/subagents/registerSubagentsExtension.js";
import { registerPiPackagesExtension } from "@extensions/pi-packages/registerPiPackagesExtension.js";
import { registerHerdrAgentEndLogExtension } from "@extensions/herdr-agent-end-log/registerHerdrAgentEndLogExtension.js";

/**
 * Creates the code-backed extension registration map.
 *
 * Maps each extension ID to its registration function.
 * The notify extension no longer has a special case — it's handled
 * by the standard feature-flag system (users disable via config.json).
 *
 * @returns Extension registration map by id.
 */
export function createExtensionRegisterMap(): Record<
	string,
	(pi: ExtensionAPI) => void | Promise<void>
> {
	return {
		"ai-providers": registerAiProvidersExtension,
		"auto-update": registerAutoUpdateExtension,
		cmux: registerCmuxExtension,
		"context-usage": registerContextUsageExtension,
		"feature-management": registerFeatureManagementExtension,
		fff: registerFffExtension,
		rtk: registerRtkExtension,
		observations: registerObservationsExtension,
		"neo-editor": registerNeoEditorExtension,
		"hotkeys": registerHotkeysExtension,
		"slash-menu": registerSlashMenuExtension,
		"mini-app-manager": registerMiniAppManagerExtension,
		notify: registerNotifyExtension,
		"system-prompt": registerSystemPromptExtension,
		"exit-message": registerExitMessageExtension,
		"startup-hero": registerStartupHeroExtension,
		tetris: registerTetrisExtension,
		tron: registerTronExtension,
		webtools: registerWebSearchExtension,
		"local-image-reader": registerLocalImageReaderExtension,
		subagents: registerSubagentsExtension,
		"pi-packages": registerPiPackagesExtension,
		herdrAgentEndLog: registerHerdrAgentEndLogExtension,
	};
}
