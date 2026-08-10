import type { ProvidersConfig } from "./types.js";
import { readNexusUserConfig } from "@nexus/runtime/config/readNexusUserConfig.js";

/**
 * Reads configured providers from the Nexus user config file.
 *
 * Reads the `providers` key from config.json. Returns `{}` (empty map)
 * when no providers are configured.
 *
 * @returns Provider config map, or an empty map when none exist.
 */
export function readProviderConfig(): ProvidersConfig {
  const config = readNexusUserConfig();
  const providers = config.providers ?? {};
  // Return only entries that have host/port (connection config), skip
  // entries that are just `{ enabled: false }` without connection info.
  const result: ProvidersConfig = {};
  for (const [id, entry] of Object.entries(providers)) {
    if (entry && typeof entry === 'object' && 'host' in entry && 'port' in entry) {
      result[id] = entry as ProviderConfig;
    }
  }
  return result;
}
