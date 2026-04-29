/**
 * Reports whether a Cursor provider warning is an expected empty-discovery startup warning.
 *
 * @param args Console warning arguments.
 * @returns True when the warning should be suppressed.
 */
export function shouldSuppressCursorModelDiscoveryWarning(args: readonly unknown[]): boolean {
	return args.some((arg) => String(arg).includes("[cursor-provider] Model discovery returned no models"));
}
