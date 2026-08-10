import type { ConfiguredPackage } from "@earendil-works/pi-coding-agent";
import type { NexusUserConfig } from "@nexus/runtime/config/types";
import { createConfiguredPackageRows } from "../package/createConfiguredPackageRows";
import type { ManagedExtensionRow } from "./types";
import { sortManagedExtensionRows } from "./sortManagedExtensionRows";

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
