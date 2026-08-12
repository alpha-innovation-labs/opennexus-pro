import { DEFAULT_PORTS } from "@extensions/ai-providers";

/**
 * Returns all known provider IDs from DEFAULT_PORTS, sorted alphabetically.
 *
 * @returns Sorted array of provider IDs.
 */
export function getAllProviderIds(): string[] {
	return Object.keys(DEFAULT_PORTS).sort();
}
