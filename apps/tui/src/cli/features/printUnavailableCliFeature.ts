/**
 * Prints a consistent unavailable-feature message for gated CLI commands.
 *
 * @param featureId Feature id requested by the user.
 */
export function printUnavailableCliFeature(featureId: string): void {
	console.error(`nexus ${featureId} is not available in this build.`);
}
