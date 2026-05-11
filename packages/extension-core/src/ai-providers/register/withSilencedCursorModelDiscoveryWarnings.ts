import { shouldSuppressCursorModelDiscoveryWarning } from "./shouldSuppressCursorModelDiscoveryWarning.js";

/**
 * Runs Cursor model discovery while hiding the provider's noisy empty-result warning.
 *
 * @param discover Discovery callback that may print the known warning.
 * @returns Discovery callback result.
 */
export async function withSilencedCursorModelDiscoveryWarnings<T>(discover: () => Promise<T>): Promise<T> {
	const originalWarn = console.warn;
	console.warn = (...args: unknown[]) => {
		if (shouldSuppressCursorModelDiscoveryWarning(args)) return;
		originalWarn(...args);
	};
	try {
		return await discover();
	} finally {
		console.warn = originalWarn;
	}
}
