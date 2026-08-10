import { readNexusUserConfig } from "@nexus/runtime/config/readNexusUserConfig.js";
import { writeNexusUserConfig } from "@nexus/runtime/config/writeNexusUserConfig.js";

/**
 * Enables or disables a provider in the Nexus user config.
 *
 * Updates the existing `providers.<id>.enabled` field in config.json.
 * If the provider doesn't exist yet, creates an entry with just `enabled`.
 *
 * @param providerId Provider identifier.
 * @param enabled Whether to enable (true) or disable (false).
 */
export function toggleProviderEnabled(
  providerId: string,
  enabled: boolean,
): void {
  const config = readNexusUserConfig();
  const providers = config.providers ?? {};
  if (!providers[providerId]) {
    providers[providerId] = {};
  }
  (providers[providerId] as { enabled?: boolean }).enabled = enabled;
  writeNexusUserConfig({ ...config, providers });
}
