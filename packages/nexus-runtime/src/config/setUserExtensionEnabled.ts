import { readNexusUserConfig } from "./readNexusUserConfig";
import type { NexusUserConfig } from "./types";
import { writeNexusUserConfig } from "./writeNexusUserConfig";

/**
 * Persists one package enabled preference in the Nexus user config.
 *
 * Writes to `pi_packages.<source>` as a flat boolean.
 *
 * @param packageSource Package source string (e.g. "npm:pi-chrome").
 * @param enabled Whether the package should be enabled for this user.
 * @returns The updated user config.
 */
export function setUserExtensionEnabled(
	packageSource: string,
	enabled: boolean,
): NexusUserConfig {
	const config = readNexusUserConfig();
	const current = config.extensions?.pi_packages ?? {};
	const next = { ...current, [packageSource]: enabled };
	const nextExtensions =
		Object.keys(next).length > 0 ? { pi_packages: next } : {};
	const nextConfig: NexusUserConfig = {
		...config,
		extensions: { ...config.extensions, ...nextExtensions },
		// Remove extensions key entirely when it has no pi_packages
		...(Object.keys(next).length === 0 ? { extensions: undefined } : {}),
	};
	writeNexusUserConfig(nextConfig);
	return nextConfig;
}
