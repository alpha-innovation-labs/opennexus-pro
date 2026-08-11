import type { NexusUserConfig } from "@nexus/runtime/config/types";
import type { ConfiguredPackage, ManagedExtensionRow } from "../model/types";
import { normalizeNpmPackageName } from "./normalizeNpmPackageName";

/**
 * Creates third-party package rows from Nexus settings package sources.
 *
 * @param packages Configured package manager entries.
 * @param userConfig User config with per-package enablement overrides.
 * @returns Extension-manager rows for configured third-party packages.
 */
export function createConfiguredPackageRows(
	packages: ConfiguredPackage[],
	userConfig: NexusUserConfig,
): ManagedExtensionRow[] {
	return packages.map((entry) => {
		const name = normalizeNpmPackageName(entry.source);
		// Read from `extensions.pi_packages` — supports both full source (npm:pi-chrome)
		// and normalized name (pi-chrome) for backwards compatibility.
		const piPackages = userConfig.extensions?.pi_packages ?? {};
		const enabled =
			piPackages[entry.source] !== false && piPackages[name] !== false;
		return {
			id: name,
			kind: "third-party" as const,
			status: enabled ? ("enabled" as const) : ("disabled" as const),
			features: [
				entry.source,
				entry.scope === "project" ? "project package" : "user package",
			],
			rowType: "package" as const,
			source: entry.source,
			scope: entry.scope,
			location: entry.installedPath,
		};
	});
}
