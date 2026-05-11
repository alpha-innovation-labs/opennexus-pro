import { readNexusUserConfig } from "./readNexusUserConfig.js";
import { writeNexusUserConfig } from "./writeNexusUserConfig.js";

/**
 * Removes one persisted user extension preference from the Nexus user config.
 *
 * @param extensionId Extension id to remove from user config.
 * @returns True when the config contained the extension id.
 */
export function removeUserExtensionConfig(extensionId: string): boolean {
	const config = readNexusUserConfig();
	if (!config.extensions?.[extensionId]) return false;

	const extensions = { ...config.extensions };
	delete extensions[extensionId];
	const nextConfig = { ...config, extensions: Object.keys(extensions).length > 0 ? extensions : undefined };
	writeNexusUserConfig(nextConfig);
	return true;
}
