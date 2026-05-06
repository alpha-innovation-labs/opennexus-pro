import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { createCompiledFeatureFlagsConfig } from "./createCompiledFeatureFlagsConfig.mjs";
import { getCompiledEnabledExtensionIds } from "./getCompiledEnabledExtensionIds.mjs";

const sourcePath = resolve("feature-flags.json");
const outputPath = resolve(
	"packages",
	"extensions",
	"src",
	"generated",
	"registerCompiledEnabledExtensions.ts",
);

const extensionModules = {
	"ai-providers": {
		importPath: "../ai-providers/registerAiProvidersExtension.js",
		exportName: "registerAiProvidersExtension",
	},
	annotate: {
		importPath: "@nexus/mini-apps/annotate/registerAnnotateExtension.js",
		exportName: "registerAnnotateExtension",
	},
	cmux: {
		importPath: "../cmux/registerCmuxExtension.js",
		exportName: "registerCmuxExtension",
	},
	"context-usage": {
		importPath: "../context-usage/registerContextUsageExtension.js",
		exportName: "registerContextUsageExtension",
	},
	"extension-manager": {
		importPath: "../extension-manager/registerExtensionManagerExtension.js",
		exportName: "registerExtensionManagerExtension",
	},
	"feature-management": {
		importPath:
			"../feature-management/registerCompiledFeatureManagementExtension.js",
		exportName: "registerCompiledFeatureManagementExtension",
	},
	fff: {
		importPath: "../fff/index.js",
		exportName: "default",
		localName: "registerFffExtension",
	},
	impeccable: {
		importPath: "../impeccable/index.js",
		exportName: "default",
		localName: "registerImpeccableExtension",
	},
	kanban: {
		importPath: "@nexus/mini-apps/kanban/registerKanbanExtension.js",
		exportName: "registerKanbanExtension",
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
		importPath: "../observations/registerObservationsExtension.js",
		exportName: "registerObservationsExtension",
	},
	"oh-my-pi-lsp": {
		importPath: "../oh-my-pi-lsp/registerOhMyPiLspExtension.js",
		exportName: "registerOhMyPiLspExtension",
	},
	prompts: {
		importPath: "../prompts/registerPromptsExtension.js",
		exportName: "registerPromptsExtension",
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
	playground: {
		importPath: "@nexus/mini-apps/playground/registerPlaygroundExtension.js",
		exportName: "registerPlaygroundExtension",
	},
	rtk: {
		importPath: "../rtk/registerRtkExtension.js",
		exportName: "registerRtkExtension",
	},
	"term-modal": {
		importPath: "@nexus/mini-apps/term-modal/registerTermModalExtension.js",
		exportName: "registerTermModalExtension",
	},
	todo: {
		importPath: "@nexus/mini-apps/todo/registerTodoExtension.js",
		exportName: "registerTodoExtension",
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
	workspace: {
		importPath: "@nexus/mini-apps/workspace/registerWorkspaceExtension.js",
		exportName: "registerWorkspaceExtension",
	},
	workflows: {
		importPath: "@nexus/mini-apps/workflows/registerWorkflowsExtension.js",
		exportName: "registerWorkflowsExtension",
	},
	websearch: {
		importPath: "../vendor-runtime/registerVendorWebsearchExtension.js",
		exportName: "registerVendorWebsearchExtension",
	},
	"mcp-adapter": {
		importPath: "../vendor-runtime/registerVendorMcpAdapterExtension.js",
		exportName: "registerVendorMcpAdapterExtension",
	},
	"rpiv-todo": {
		importPath: "../vendor-runtime/registerVendorRpivTodoExtension.js",
		exportName: "registerVendorRpivTodoExtension",
	},
	"rpiv-ask-user-question": {
		importPath:
			"../vendor-runtime/registerVendorRpivAskUserQuestionExtension.js",
		exportName: "registerVendorRpivAskUserQuestionExtension",
	},
	"pi-lens": {
		importPath: "../vendor-runtime/registerVendorPiLensExtension.js",
		exportName: "registerVendorPiLensExtension",
	},
};

/**
 * Creates the TypeScript module source for the compiled bundled extensions.
 *
 * @param {string[]} enabledIds Extension ids enabled in feature-flags.json.
 * @returns {string} TypeScript module source.
 */
function createModuleSource(enabledIds) {
	const imports = [
		'import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";',
		'import { applySystemExtensionAvailability } from "@nexus/feature-flags/applySystemExtensionAvailability.js";',
		'import { applyUserExtensionConfig } from "@nexus/feature-flags/applyUserExtensionConfig.js";',
		'import { getBundledFeatureFlagsConfig } from "@nexus/feature-flags/getBundledFeatureFlagsConfig.js";',
		'import { createTelemetryExtensionApi } from "@nexus/feature-flags/createTelemetryExtensionApi.js";',
	];

	for (const id of enabledIds) {
		const entry = extensionModules[id];
		if (!entry) {
			throw new Error(
				`Missing compiled extension module mapping for feature flag: ${id}`,
			);
		}

		if (entry.exportName === "default") {
			imports.push(`import ${entry.localName} from "${entry.importPath}";`);
			continue;
		}

		imports.push(`import { ${entry.exportName} } from "${entry.importPath}";`);
	}

	const registerMapLines = enabledIds.map((id) => {
		const entry = extensionModules[id];
		const localName =
			entry.exportName === "default" ? entry.localName : entry.exportName;
		return `  ${JSON.stringify(id)}: ${localName},`;
	});

	return [
		...imports,
		"",
		"/**",
		" * Extension ids compiled into the release bundle.",
		" */",
		`export const compiledBundledExtensionIds = ${JSON.stringify(enabledIds, null, 2)} as const;`,
		"",
		"const compiledBundledExtensionRegisterMap: Record<string, (pi: ExtensionAPI) => void | Promise<void>> = {",
		...registerMapLines,
		"};",
		"",
		"/**",
		" * Registers only extensions compiled into the release bundle that remain enabled at runtime.",
		" *",
		" * @param pi Pi extension API.",
		" */",
		"export default async function registerCompiledEnabledExtensions(pi: ExtensionAPI): Promise<void> {",
		"  const config = applySystemExtensionAvailability(applyUserExtensionConfig(getBundledFeatureFlagsConfig()));",
		"",
		"  for (const id of compiledBundledExtensionIds) {",
		"    if (!(config.extensions[id]?.enabled ?? config.other?.[id]?.enabled)) continue;",
		"    await compiledBundledExtensionRegisterMap[id]?.(createTelemetryExtensionApi(pi, id));",
		"  }",
		"}",
		"",
	].join("\n");
}

/**
 * Regenerates the compiled bundled extension module from the root JSON file.
 *
 * @returns {Promise<void>}
 */
async function generateCompiledBundledExtensions() {
	const rawConfig = await readFile(sourcePath, "utf8");
	const parsedConfig = JSON.parse(rawConfig);
	const enabledIds = getCompiledEnabledExtensionIds(
		createCompiledFeatureFlagsConfig(parsedConfig),
		new Set(Object.keys(extensionModules)),
	);
	const moduleSource = createModuleSource(enabledIds);
	await mkdir(dirname(outputPath), { recursive: true });
	await writeFile(outputPath, moduleSource, "utf8");
}

await generateCompiledBundledExtensions();
