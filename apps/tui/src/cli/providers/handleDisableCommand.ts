import { toggleProviderEnabled } from "@extensions/ai-providers";
import { getAllProviderIds } from "./getAllProviderIds";

/**
 * Handles the "disable" subcommand: disables a provider.
 *
 * Validates the provider ID, then calls toggleProviderEnabled with false.
 *
 * @param providerId Provider identifier.
 * @returns Exit code.
 */
export function handleDisableCommand(providerId: string): number {
	const knownIds = getAllProviderIds();
	if (!knownIds.includes(providerId)) {
		console.error(`Unknown provider: ${providerId}`);
		console.error(`Known providers: ${knownIds.join(", ")}`);
		return 1;
	}

	toggleProviderEnabled(providerId, false);
	console.log(`Provider '${providerId}' disabled.`);
	return 0;
}
