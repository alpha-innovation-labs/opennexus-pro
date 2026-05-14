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
	cmux: {
		importPath: "@nexus/extensions-pro/cmux/registerCmuxExtension.js",
		exportName: "registerCmuxExtension",
	},
	"context-usage": {
		importPath: "../context-usage/registerContextUsageExtension.js",
		exportName: "registerContextUsageExtension",
	},
	"chat-status": {
		importPath: "../chat-status/registerChatStatusExtension.js",
		exportName: "registerChatStatusExtension",
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
	memory: {
		importPath: "@nexus/mini-apps/memory/registerMemoryExtension.js",
		exportName: "registerMemoryExtension",
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
	"oh-my-pi-lsp": {
		importPath: "@nexus/extensions-dev/oh-my-pi-lsp/registerOhMyPiLspExtension.js",
		exportName: "registerOhMyPiLspExtension",
	},
	"system-prompt": {
		importPath: "../system-prompt/registerSystemPromptExtension.js",
		exportName: "registerSystemPromptExtension",
	},
	"exit-message": {
		importPath: "../exit-message/registerExitMessageExtension.js",
		exportName: "registerExitMessageExtension",
	},
	"startup-hero": {
		importPath: "../startup-hero/registerStartupHeroExtension.js",
		exportName: "registerStartupHeroExtension",
	},
	"sub-agents": {
		importPath: "../sub-agents/index.js",
		exportName: "default",
		localName: "registerSubAgentsExtension",
	},
	"sub-agent-status-widget": {
		importPath:
			"../sub-agent-status-widget/registerSubagentStatusWidgetExtension.js",
		exportName: "default",
		localName: "registerSubagentStatusWidgetExtension",
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
	slashusage: {
		importPath: "../slashusage/index.js",
		exportName: "default",
		localName: "registerSlashusageExtension",
	},
	wallet: {
		importPath: "@nexus/mini-apps/wallet/registerWalletExtension.js",
		exportName: "registerWalletExtension",
	},
	websearch: {
		importPath: "../web-search/registerWebSearchExtension.js",
		exportName: "registerWebSearchExtension",
	},
	"ask-user-question": {
		importPath: "../ask-user-question/registerAskUserQuestionExtension.js",
		exportName: "registerAskUserQuestionExtension",
	},
	"prompt-queue": {
		importPath: "../prompt-queue/registerPromptQueueExtension.js",
		exportName: "registerPromptQueueExtension",
	},
};
