/**
 * Formats the gateway start command result message.
 *
 * @param started Whether the gateway was started by this command.
 * @returns User-facing start result message.
 */
export function formatGatewayStartMessage(started: boolean): string {
	return started ? "gateway started" : "gateway already running";
}
