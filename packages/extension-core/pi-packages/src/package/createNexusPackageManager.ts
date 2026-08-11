import { getNexusAgentDirPath } from "@nexus/runtime/config/getNexusAgentDirPath";
import { DefaultPackageManager } from "@earendil-works/pi-coding-agent";
import { SettingsManager } from "@earendil-works/pi-coding-agent";
import { readNexusUserConfig } from "@nexus/runtime/config/readNexusUserConfig";
import { normalizeNpmPackageName } from "./normalizeNpmPackageName";
import type { ConfiguredPackage } from "../model/types";

/** Package manager patched to also read from extensions.pi_packages. */
export type NexusPackageManagerRuntime = {
	packageManager: DefaultPackageManager;
};

/**
 * Creates Pi's package manager after Nexus config patching has redirected settings paths.
 * Patches listConfiguredPackages to also read from extensions.pi_packages.
 *
 * @param cwd Current command working directory.
 * @returns Package manager runtime backed by Nexus settings.
 */
export function createNexusPackageManager(cwd: string): NexusPackageManagerRuntime {
	const settingsManager = SettingsManager.create(cwd, getNexusAgentDirPath());
	const packageManager = new DefaultPackageManager({ cwd, agentDir: getNexusAgentDirPath(), settingsManager });
	// Patch listConfiguredPackages to also read from extensions.pi_packages.
	const originalListConfiguredPackages = packageManager.listConfiguredPackages.bind(packageManager);
	packageManager.listConfiguredPackages = function () {
		const configuredPackages = originalListConfiguredPackages();
		const userConfig = readNexusUserConfig();
		const piPackages = userConfig.extensions?.pi_packages;
		if (piPackages) {
			for (const source of Object.keys(piPackages)) {
				// Avoid duplicating sources already in the packages array.
				// Normalize the config key so "pi-chrome" matches "npm:pi-chrome".
				const normalizedSource = normalizeNpmPackageName(source);
				if (!configuredPackages.find((p) => normalizeNpmPackageName(p.source) === normalizedSource)) {
					configuredPackages.push({
						source,
						scope: "user" as const,
						filtered: false,
						installedPath: packageManager.getInstalledPath(source, "user"),
					});
				}
			}
		}
		return configuredPackages;
	};
	return { packageManager };
}
