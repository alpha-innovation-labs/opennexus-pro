import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { createCompiledFeatureFlagsConfig } from "./createCompiledFeatureFlagsConfig.mjs";
import { getCompiledEnabledExtensionIds } from "./getCompiledEnabledExtensionIds.mjs";
import { extensionModules } from "./extensionModules.mjs";

const sourcePath = resolve("feature-flags.json");
const outputPath = resolve(
	"packages",
	"extension-core",
	"src",
	"generated",
	"registerCompiledEnabledExtensions.ts",
);


/**
 * Creates the TypeScript module source for the compiled bundled extensions.
 *
 * @param {string[]} enabledIds Extension ids enabled in feature-flags.json.
 * @returns {string} TypeScript module source.
 */
function createModuleSource(enabledIds) {
	const imports = [
		'import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";',
		'import { applySystemExtensionAvailability } from "@nexus/feature-flags/applySystemExtensionAvailability.js";',
		'import { applyUserExtensionConfig } from "@nexus/feature-flags/applyUserExtensionConfig.js";',
		'import { getBundledFeatureFlagsConfig } from "@nexus/feature-flags/getBundledFeatureFlagsConfig.js";',
		'import { createTelemetryExtensionApi } from "@nexus/feature-flags/createTelemetryExtensionApi.js";',
		'import { setRuntimeExtensionFeatureFlags } from "@nexus/feature-flags/runtimeExtensionFeatureState.js";',
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
		"  setRuntimeExtensionFeatureFlags(compiledBundledExtensionIds.map((id) => ({ id, enabled: Boolean(config.extensions[id]?.enabled ?? config.other?.[id]?.enabled) })));",
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
