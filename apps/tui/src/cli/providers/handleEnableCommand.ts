import { getAllProviderIds } from "./getAllProviderIds";
import { toggleProviderEnabled } from "@extensions/ai-providers/config/toggleProviderEnabled";

/**
 * Handles the "enable" subcommand: enables a provider.
 *
 * Validates the provider ID, then calls toggleProviderEnabled with true.
 *
 * @param providerId Provider identifier.
 * @returns Exit code.
 */
export function handleEnableCommand(providerId: string): number {
  const knownIds = getAllProviderIds();
  if (!knownIds.includes(providerId)) {
    console.error(`Unknown provider: ${providerId}`);
    console.error(`Known providers: ${knownIds.join(", ")}`);
    return 1;
  }

  toggleProviderEnabled(providerId, true);
  console.log(`Provider '${providerId}' enabled.`);
  return 0;
}
