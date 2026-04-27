/**
 * Formats the gateway restart command result message.
 *
 * @param restarted Whether the gateway was restarted by this command.
 * @returns User-facing restart result message.
 */
export function formatGatewayRestartMessage(restarted: boolean): string {
	return restarted ? "gateway restarted" : "gateway restart failed";
}
