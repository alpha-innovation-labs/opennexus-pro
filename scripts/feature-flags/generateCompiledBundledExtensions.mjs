import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const sourcePath = resolve("feature-flags.json");
const outputPath = resolve("src", "extensions", "generated", "registerCompiledEnabledExtensions.ts");

const extensionModules = {
  annotate: { importPath: "../annotate/registerAnnotateExtension.js", exportName: "registerAnnotateExtension" },
  cmux: { importPath: "../cmux/registerCmuxExtension.js", exportName: "registerCmuxExtension" },
  "context-usage": {
    importPath: "../context-usage/registerContextUsageExtension.js",
    exportName: "registerContextUsageExtension",
  },
  "feature-management": {
    importPath: "../feature-management/registerCompiledFeatureManagementExtension.js",
    exportName: "registerCompiledFeatureManagementExtension",
  },
  fff: { importPath: "../fff/index.js", exportName: "default", localName: "registerFffExtension" },
  kanban: { importPath: "../kanban/registerKanbanExtension.js", exportName: "registerKanbanExtension" },
  "md-editor": { importPath: "../md-editor/registerMdEditorExtension.js", exportName: "registerMdEditorExtension" },
  "neo-editor": { importPath: "../neo-editor/registerNeoEditorExtension.js", exportName: "default", localName: "registerNeoEditorExtension" },
  notify: { importPath: "../notify/registerNotifyExtension.js", exportName: "registerNotifyExtension" },
  observations: { importPath: "../observations/registerObservationsExtension.js", exportName: "registerObservationsExtension" },
  "exit-message": { importPath: "../exit-message/registerExitMessageExtension.js", exportName: "registerExitMessageExtension" },
  "startup-logo": { importPath: "../startup-logo/registerStartupLogoExtension.js", exportName: "registerStartupLogoExtension" },
  "sub-agents": { importPath: "../sub-agents/index.js", exportName: "default", localName: "registerSubAgentsExtension" },
  "sub-agent-status-widget": {
    importPath: "../sub-agent-status-widget/registerSubagentStatusWidgetExtension.js",
    exportName: "default",
    localName: "registerSubagentStatusWidgetExtension",
  },
  playground: { importPath: "../playground/registerPlaygroundExtension.js", exportName: "registerPlaygroundExtension" },
  rtk: { importPath: "../rtk/registerRtkExtension.js", exportName: "registerRtkExtension" },
  "term-modal": { importPath: "../term-modal/registerTermModalExtension.js", exportName: "registerTermModalExtension" },
  todo: { importPath: "../todo/registerTodoExtension.js", exportName: "registerTodoExtension" },
  tron: { importPath: "../tron/index.js", exportName: "default", localName: "registerTronExtension" },
  workspace: { importPath: "../workspace/registerWorkspaceExtension.js", exportName: "registerWorkspaceExtension" },
  workflows: { importPath: "../workflows/registerWorkflowsExtension.js", exportName: "registerWorkflowsExtension" },
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
    'import { applySystemExtensionAvailability } from "../../feature-flags/applySystemExtensionAvailability.js";',
    'import { getBundledFeatureFlagsConfig } from "../../feature-flags/getBundledFeatureFlagsConfig.js";',
  ];

  for (const id of enabledIds) {
    const entry = extensionModules[id];
    if (!entry) {
      throw new Error(`Missing compiled extension module mapping for feature flag: ${id}`);
    }

    if (entry.exportName === "default") {
      imports.push(`import ${entry.localName} from "${entry.importPath}";`);
      continue;
    }

    imports.push(`import { ${entry.exportName} } from "${entry.importPath}";`);
  }

  const registerMapLines = enabledIds.map((id) => {
    const entry = extensionModules[id];
    const localName = entry.exportName === "default" ? entry.localName : entry.exportName;
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
    "const compiledBundledExtensionRegisterMap: Record<string, (pi: ExtensionAPI) => void> = {",
    ...registerMapLines,
    "};",
    "",
    "/**",
    " * Registers only extensions compiled into the release bundle that remain enabled at runtime.",
    " *",
    " * @param pi Pi extension API.",
    " */",
    "export default function registerCompiledEnabledExtensions(pi: ExtensionAPI): void {",
    "  const config = applySystemExtensionAvailability(getBundledFeatureFlagsConfig());",
    "",
    "  for (const id of compiledBundledExtensionIds) {",
    "    if (!config.extensions[id]?.enabled) continue;",
    "    compiledBundledExtensionRegisterMap[id]?.(pi);",
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
  const enabledIds = Object.entries(parsedConfig.extensions)
    .filter(([, value]) => value.enabled && value.devOnly !== true)
    .map(([id]) => id);
  const moduleSource = createModuleSource(enabledIds);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, moduleSource, "utf8");
}

await generateCompiledBundledExtensions();
