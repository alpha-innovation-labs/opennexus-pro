import { readNexusUserConfig } from "./readNexusUserConfig.js";
import type { NexusUserConfig } from "./types.js";
import { writeNexusUserConfig } from "./writeNexusUserConfig.js";

/**
 * Persists one extension enabled preference in the Nexus user config.
 *
 * @param extensionId Built-in extension id.
 * @param enabled Whether the extension should be enabled for this user.
 * @returns The updated user config.
 */
export function setUserExtensionEnabled(extensionId: string, enabled: boolean): NexusUserConfig {
	const config = readNexusUserConfig();
	const nextConfig: NexusUserConfig = {
		...config,
		extensions: {
			...(config.extensions ?? {}),
			[extensionId]: {
				...(config.extensions?.[extensionId] ?? {}),
				enabled,
			},
		},
	};
	writeNexusUserConfig(nextConfig);
	return nextConfig;
}
