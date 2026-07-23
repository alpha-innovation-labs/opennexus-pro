import { readNexusUserConfig } from "./readNexusUserConfig.js";
import type { NexusUserConfig } from "./types.js";
import { writeNexusUserConfig } from "./writeNexusUserConfig.js";

/**
 * Removes one persisted user package preference from the Nexus user config.
 *
 * @param packageSource Package source string to remove from user config.
 * @returns True when the config contained the package source.
 */
export function removeUserExtensionConfig(packageSource: string): boolean {
	const config = readNexusUserConfig();
	if (!(config.extensions?.pi_packages?.[packageSource] !== undefined)) return false;

	const pi_packages = { ...config.extensions.pi_packages };
	delete pi_packages[packageSource];
	const nextConfig: NexusUserConfig = { ...config };
	if (Object.keys(pi_packages).length > 0) {
		nextConfig.extensions = { ...config.extensions, pi_packages };
	} else {
		// Remove pi_packages when empty; remove extensions entirely when no pi_packages remain
		if (config.extensions && Object.keys(config.extensions).length === 1) {
			// Only pi_packages was in extensions
			delete nextConfig.extensions;
		} else if (config.extensions) {
			const { pi_packages: _pp, ...rest } = config.extensions;
			if (Object.keys(rest).length === 0) {
				delete nextConfig.extensions;
			} else {
				nextConfig.extensions = rest;
			}
		}
	}
	writeNexusUserConfig(nextConfig);
	return true;
}
