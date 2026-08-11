import { readNexusUserConfig } from "@nexus/runtime/config/readNexusUserConfig";
import { writeNexusUserConfig } from "@nexus/runtime/config/writeNexusUserConfig";
import type { ProviderConfig } from "./types";

/**
 * Writes a provider config into the Nexus user config file.
 *
 * Reads the existing config, merges the new provider config into
 * `providers`, and writes back via `writeNexusUserConfig()`.
 *
 * @param providerId Provider identifier (e.g. "ollama").
 * @param config Provider connection config (host, port, api_key).
 */
export function writeProviderConfig(
	providerId: string,
	config: ProviderConfig,
): void {
	const userConfig = readNexusUserConfig();
	const providers = userConfig.providers ?? {};
	providers[providerId] = config as { enabled: boolean };
	writeNexusUserConfig({ ...userConfig, providers } as Parameters<
		typeof writeNexusUserConfig
	>[0]);
}
