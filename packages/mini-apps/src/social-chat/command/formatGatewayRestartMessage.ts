/**
 * Formats the gateway restart command result message.
 *
 * @param restarted Whether the gateway was restarted by this command.
 * @returns User-facing result message.
 */
export function formatGatewayRestartMessage(restarted: boolean): string {
	return restarted ? "social chat restarted" : "social chat restart failed";
}
