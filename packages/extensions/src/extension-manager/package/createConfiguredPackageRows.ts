import type { ConfiguredPackage } from "../../../../../node_modules/@mariozechner/pi-coding-agent/dist/core/package-manager.js";
import type { NexusUserConfig } from "@nexus/runtime/config/types.js";
import type { ManagedExtensionRow } from "../model/types.js";
import { normalizeNpmPackageName } from "./normalizeNpmPackageName.js";

/**
 * Creates third-party package rows from Nexus settings package sources.
 *
 * @param packages Configured package manager entries.
 * @param userConfig User config with per-extension enablement overrides.
 * @returns Extension-manager rows for configured third-party packages.
 */
export function createConfiguredPackageRows(packages: ConfiguredPackage[], userConfig: NexusUserConfig): ManagedExtensionRow[] {
	return packages.map((entry) => {
		const name = normalizeNpmPackageName(entry.source);
		const enabled = userConfig.extensions?.[name]?.enabled !== false;
		return {
			id: name,
			kind: "third-party" as const,
			status: enabled ? "enabled" as const : "disabled" as const,
			features: [entry.source, entry.scope === "project" ? "project package" : "user package"],
			rowType: "package" as const,
			source: entry.source,
			scope: entry.scope,
			location: entry.installedPath,
		};
	});
}
