import { isBundledBinary } from "@nexus/runtime/package/isBundledBinary.js";

/**
 * Decides whether the startup hero should include developer-only startup timing.
 *
 * @param importMetaUrl Current module URL.
 * @returns True for source/dev runs and false for bundled release binaries.
 */
export function shouldShowStartupDurationBadge(importMetaUrl: string): boolean {
	return !isBundledBinary(importMetaUrl);
}
