/**
 * Formats the gateway stop command result message.
 *
 * @param stopped Whether the gateway was stopped by this command.
 * @returns User-facing stop result message.
 */
export function formatGatewayStopMessage(stopped: boolean): string {
	return stopped ? "gateway stopped" : "gateway already stopped";
}
