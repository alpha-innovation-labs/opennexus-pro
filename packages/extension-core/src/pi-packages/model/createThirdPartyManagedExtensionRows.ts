import type { ConfiguredPackage } from "@earendil-works/pi-coding-agent/dist/core/package-manager.js";
import type { NexusUserConfig } from "@nexus/runtime/config/types.js";
import { createConfiguredPackageRows } from "../package/createConfiguredPackageRows.js";
import type { ManagedExtensionRow } from "./types.js";
import { sortManagedExtensionRows } from "./sortManagedExtensionRows.js";

/**
 * Creates Pi packages rows from configured third-party package settings only.
 *
 * @param userConfig User config with package enablement preferences.
 * @param packages Configured package manager entries from Nexus settings.
 * @returns Sorted third-party package rows for display.
 */
export function createThirdPartyManagedExtensionRows(userConfig: NexusUserConfig, packages: ConfiguredPackage[] = []): ManagedExtensionRow[] {
	return sortManagedExtensionRows(createConfiguredPackageRows(packages, userConfig));
}
