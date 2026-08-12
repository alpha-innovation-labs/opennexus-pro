import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { registerAiProvidersExtension } from "@extensions/ai-providers";
import { registerAutoUpdateExtension } from "@extensions/auto-update/registerAutoUpdateExtension";
import { registerCmuxExtension } from "@extensions/cmux/registerCmuxExtension";
import { registerContextUsageExtension } from "@extensions/context-usage/registerContextUsageExtension";
import { registerExitMessageExtension } from "@extensions/exit-message";
import { registerFeatureManagementExtension } from "@extensions/feature-management/registerFeatureManagementExtension";
import registerFffExtension from "@extensions/fff/index";
import { registerHerdrAgentEndLogExtension } from "@extensions/herdr-agent-end-log/registerHerdrAgentEndLogExtension";
import { registerHotkeysExtension } from "@extensions/hotkeys/registerHotkeysExtension";
import registerLocalImageReaderExtension from "@extensions/local-image-reader/registerLocalImageReaderExtension";
import registerNeoEditorExtension from "@extensions/neo-editor/registerNeoEditorExtension";
import { registerNotifyExtension } from "@extensions/notify/registerNotifyExtension";
import { registerObservationsExtension } from "@extensions/observations";
import { registerPiPackagesExtension } from "@extensions/pi-packages";
import { registerRtkExtension } from "@extensions/rtk/registerRtkExtension";
import { registerSlashMenuExtension } from "@extensions/slash-menu/registerSlashMenuExtension";
import { registerStartupHeroExtension } from "@extensions/startup-hero";
import { registerSubagentsExtension } from "@extensions/subagents/registerSubagentsExtension";
import { registerSystemPromptExtension } from "@extensions/system-prompt/registerSystemPromptExtension";
import registerTronExtension from "@extensions/tron/index";
import { registerWebSearchExtension } from "@extensions/web-search/registerWebSearchExtension";
import { registerMiniAppManagerExtension } from "@nexus/mini-apps";
import { registerTetrisExtension } from "@nexus/mini-apps";

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
		hotkeys: registerHotkeysExtension,
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
