export const extensionModules = {
	"ai-providers": {
		importPath: "../ai-providers/registerAiProvidersExtension.js",
		exportName: "registerAiProvidersExtension",
	},
	annotate: {
		importPath: "@nexus/mini-apps/annotate/registerAnnotateExtension.js",
		exportName: "registerAnnotateExtension",
	},
	automations: {
		importPath: "@nexus/mini-apps/automations/registerAutomationsExtension.js",
		exportName: "registerAutomationsExtension",
	},
	"auto-update": {
		importPath: "../auto-update/registerAutoUpdateExtension.js",
		exportName: "registerAutoUpdateExtension",
	},
	"local-image-reader": {
		importPath: "../local-image-reader/registerLocalImageReaderExtension.js",
		exportName: "default",
		localName: "registerLocalImageReaderExtension",
	},
	cmux: {
		importPath: "@nexus/extensions-pro/cmux/registerCmuxExtension.js",
		exportName: "registerCmuxExtension",
	},
	"context-usage": {
		importPath: "../context-usage/registerContextUsageExtension.js",
		exportName: "registerContextUsageExtension",
	},
	"pi-packages": {
		importPath: "../pi-packages/registerPiPackagesExtension.js",
		exportName: "registerPiPackagesExtension",
	},
	"feature-management": {
		importPath:
			"@nexus/extensions-dev/feature-management/registerCompiledFeatureManagementExtension.js",
		exportName: "registerCompiledFeatureManagementExtension",
	},
	fff: {
		importPath: "../fff/index.js",
		exportName: "default",
		localName: "registerFffExtension",
	},
	"md-editor": {
		importPath: "@nexus/mini-apps/md-editor/registerMdEditorExtension.js",
		exportName: "registerMdEditorExtension",
	},
	"neo-editor": {
		importPath: "../neo-editor/registerNeoEditorExtension.js",
		exportName: "default",
		localName: "registerNeoEditorExtension",
	},
	hotkeys: {
		importPath: "../hotkeys/registerHotkeysExtension.js",
		exportName: "registerHotkeysExtension",
	},
	"slash-menu": {
		importPath: "../slash-menu/registerSlashMenuExtension.js",
		exportName: "registerSlashMenuExtension",
	},
	"mini-app-manager": {
		importPath:
			"@nexus/mini-apps/mini-app-manager/registerMiniAppManagerExtension.js",
		exportName: "registerMiniAppManagerExtension",
	},
	notify: {
		importPath: "../notify/registerNotifyExtension.js",
		exportName: "registerNotifyExtension",
	},
	observations: {
		importPath: "@nexus/extensions-pro/observations/registerObservationsExtension.js",
		exportName: "registerObservationsExtension",
	},
	// oh-my-pi-lsp: DISABLED — moved to __archives
	"system-prompt": {
		importPath: "../system-prompt/registerSystemPromptExtension.js",
		exportName: "registerSystemPromptExtension",
	},
	"exit-message": {
		importPath: "../exit-message/registerExitMessageExtension.js",
		exportName: "registerExitMessageExtension",
	},
	"herdr-agent-end-log": {
		importPath: "../herdr-agent-end-log/registerHerdrAgentEndLogExtension.js",
		exportName: "registerHerdrAgentEndLogExtension",
	},
	"startup-hero": {
		importPath: "../startup-hero/registerStartupHeroExtension.js",
		exportName: "registerStartupHeroExtension",
	},
	// sub-agents: DISABLED — moved to __archives, transcript rendering now via extension-core/src/tron/transcript/renderTranscriptLines.ts
	// sub-agent-status-widget: DISABLED — moved to __archives
	"sub-agents": {
		enabled: false,
	},
	"sub-agent-status-widget": {
		enabled: false,
	},
	rtk: {
		importPath: "@nexus/extensions-pro/rtk/registerRtkExtension.js",
		exportName: "registerRtkExtension",
	},
	todo: {
		importPath: "@nexus/extensions-dev/todo/registerTodoExtension.js",
		exportName: "registerTodoExtension",
	},
	tetris: {
		importPath: "@nexus/mini-apps/tetris/registerTetrisExtension.js",
		exportName: "registerTetrisExtension",
	},
	tron: {
		importPath: "../tron/index.js",
		exportName: "default",
		localName: "registerTronExtension",
	},
	wallet: {
		importPath: "@nexus/mini-apps/wallet/registerWalletExtension.js",
		exportName: "registerWalletExtension",
	},
	webtools: {
		importPath: "../web-search/registerWebSearchExtension.js",
		exportName: "registerWebSearchExtension",
	},
};
