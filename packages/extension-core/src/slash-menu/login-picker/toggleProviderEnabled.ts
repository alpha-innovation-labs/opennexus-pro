import { readNexusUserConfig } from "@nexus/runtime/config/readNexusUserConfig.js";
import { writeNexusUserConfig } from "@nexus/runtime/config/writeNexusUserConfig.js";

/**
 * Reads the current provider states from config, flips the enabled state for
 * one provider, and writes the updated state back to disk.
 *
 * @param providerId Provider id to toggle.
 * @returns The updated states map and the next enabled value.
 */
export function toggleProviderEnabled(
  providerId: string,
): { states: Record<string, { enabled: boolean }>; nextEnabled: boolean } {
  const config = readNexusUserConfig();
  const states: Record<string, { enabled: boolean }> = config.providers ?? {};
  const current = states[providerId]?.enabled ?? false;
  const nextEnabled = !current;
  states[providerId] = { enabled: nextEnabled };
  writeNexusUserConfig({ ...config, providers: states });
  return { states, nextEnabled };
}
