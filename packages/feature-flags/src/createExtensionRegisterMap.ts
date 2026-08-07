import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { registerAiProvidersExtension } from "@nexus/extensions/ai-providers/register-ai-providers/registerAiProvidersExtension.js";
import { registerAutoUpdateExtension } from "@nexus/extensions/auto-update/registerAutoUpdateExtension.js";
import { registerCmuxExtension } from "@nexus/extensions/cmux/registerCmuxExtension.js";
import { registerContextUsageExtension } from "@nexus/extensions/context-usage/registerContextUsageExtension.js";
import { registerExitMessageExtension } from "@nexus/extensions/exit-message/registerExitMessageExtension.js";
import { registerHerdrAgentEndLogExtension } from "@nexus/extensions/herdr-agent-end-log/registerHerdrAgentEndLogExtension.js";
import { registerPiPackagesExtension } from "@nexus/extensions/pi-packages/registerPiPackagesExtension.js";
import { registerFeatureManagementExtension } from "@nexus/extensions/feature-management/registerFeatureManagementExtension.js";
import registerFffExtension from "@nexus/extensions/fff/index.js";
import registerNeoEditorExtension from "@nexus/extensions/neo-editor/registerNeoEditorExtension.js";
import { registerHotkeysExtension } from "@nexus/extensions/hotkeys/registerHotkeysExtension.js";
import { registerSlashMenuExtension } from "@nexus/extensions/slash-menu/registerSlashMenuExtension.js";
import { registerMiniAppManagerExtension } from "@nexus/mini-apps/mini-app-manager/registerMiniAppManagerExtension.js";
import { registerNotifyExtension } from "@nexus/extensions/notify/registerNotifyExtension.js";
import { registerObservationsExtension } from "@nexus/extensions/observations/registerObservationsExtension.js";
import { registerSystemPromptExtension } from "@nexus/extensions/system-prompt/registerSystemPromptExtension.js";
import { registerRtkExtension } from "@nexus/extensions/rtk/registerRtkExtension.js";
import { registerStartupHeroExtension } from "@nexus/extensions/startup-hero/registerStartupHeroExtension.js";
import { registerTetrisExtension } from "@nexus/mini-apps/tetris/registerTetrisExtension.js";

import registerTronExtension from "@nexus/extensions/tron/index.js";
import { registerWebSearchExtension } from "@nexus/extensions/web-search/registerWebSearchExtension.js";
import registerLocalImageReaderExtension from "@nexus/extensions/local-image-reader/registerLocalImageReaderExtension.js";

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
		"pi-packages": registerPiPackagesExtension,
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
		"herdr-agent-end-log": registerHerdrAgentEndLogExtension,
		"startup-hero": registerStartupHeroExtension,
		tetris: registerTetrisExtension,
		tron: registerTronExtension,
		webtools: registerWebSearchExtension,
		"local-image-reader": registerLocalImageReaderExtension,
	};
}
