import { DEFAULT_PORTS } from "@extensions/ai-providers/constants/default-ports.js";
import { getAllProviderIds } from "./getAllProviderIds.js";
import { writeProviderConfig } from "@extensions/ai-providers/config/writeProviderConfig.js";

/**
 * Handles the "setup" subcommand: configures a provider with host, port, and optional API key.
 *
 * Validates the provider ID against known providers, derives host (default: "localhost"),
 * port from CLI arg or default, and optional API key. Writes config via writeProviderConfig.
 *
 * @param providerId Provider identifier (e.g. "ollama").
 * @param port Optional port override.
 * @param apiKey Optional API key.
 * @returns Exit code.
 */
export function handleSetupCommand(
  providerId: string,
  port?: number,
  apiKey?: string,
): number {
  const knownIds = getAllProviderIds();
  if (!knownIds.includes(providerId)) {
    console.error(`Unknown provider: ${providerId}`);
    console.error(`Known providers: ${knownIds.join(", ")}`);
    return 1;
  }

  const defaultPort = port ?? (DEFAULT_PORTS[providerId] ?? 0);
  if (!defaultPort) {
    console.error(`Provider ${providerId} has no default port. Specify one.`);
    return 1;
  }

  const host = "localhost";
  const config = { host, port: defaultPort };
  if (apiKey) {
    (config as unknown as Record<string, unknown>).api_key = apiKey;
  }

  writeProviderConfig(providerId, config as { host: string; port: number; api_key?: string });
  console.log(`Provider '${providerId}' configured at http://${host}:${defaultPort}.`);
  return 0;
}
