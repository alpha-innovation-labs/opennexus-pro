/**
 * Creates help text for the Nexus gateway command surface.
 *
 * @returns Gateway command help text.
 */
export function createGatewayUsageText(): string {
	return [
		"Usage: nexus gateway <start|stop|restart|status>",
		"",
		"Commands:",
		"  start     Start the background gateway",
		"  stop      Stop the background gateway",
		"  restart   Restart the background gateway",
		"  status    Show gateway status",
		"",
		"The gateway currently runs configured integrations such as Telegram polling.",
	].join("\n");
}
