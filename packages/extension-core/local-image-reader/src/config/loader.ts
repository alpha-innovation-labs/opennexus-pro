import type { LocalImageReaderConfig } from "./types.js";
import { validateSettingsEntry } from "./validators.js";
import { readNexusUserConfig } from "@nexus/runtime/config/readNexusUserConfig.js";
import { writeNexusUserConfig } from "@nexus/runtime/config/writeNexusUserConfig.js";

/**
 * Load the local-image-reader sub-entry from the Nexus user config file.
 *
 * Reads from `~/.config/nexus/config.json` under the `localImageReader` key.
 *
 * @returns Validated config, or null if not found.
 */
export function loadFromUserConfig(): LocalImageReaderConfig | null {
  const config = readNexusUserConfig();
  const entry = config.localImageReader;
  if (entry === undefined) {
    return null;
  }
  const validated = validateSettingsEntry(entry);
  return validated;
}

/**
 * Persist local-image-reader config to the Nexus user config file.
 *
 * Writes to `~/.config/nexus/config.json` under the `localImageReader` key,
 * preserving all other top-level keys.
 *
 * @param config - The validated LocalImageReaderConfig to persist.
 */
export function persistUserConfig(config: LocalImageReaderConfig): void {
  const existing = readNexusUserConfig();
  existing.localImageReader = config;
  writeNexusUserConfig(existing);
}

/**
 * Load config from the Nexus user config file.
 *
 * The config path is resolved by `getUserConfigPath()` (typically
 * `~/.config/nexus/config.json`). The entry is stored under the key
 * `localImageReader` — not `"local-image-reader"` — to follow the
 * camelCase convention used by the rest of the Nexus user config.
 *
 * @returns Validated configuration.
 * @throws If no valid configuration is found.
 */
export function resolveConfig(): LocalImageReaderConfig {
  const config = loadFromUserConfig();
  if (config) {
    return config;
  }

  throw new Error(
    "No local-image-reader configuration found.\n\n" +
      'Add a "localImageReader" entry to your Nexus user config with url and apiKey.',
  );
}
