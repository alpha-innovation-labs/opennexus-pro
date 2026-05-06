/**
 * Creates help text for the Nexus social chat mini-app command surface.
 *
 * @returns Social chat usage text.
 */
export function createGatewayUsageText(): string {
	return [
		"Usage: nexus social-chat <start|stop|restart|status>",
		"",
		"Commands:",
		"  start     Start the background social chat daemon",
		"  stop      Stop the background social chat daemon",
		"  restart   Restart the background social chat daemon",
		"  status    Show social chat daemon status",
		"",
		"Social chat currently runs configured integrations such as Telegram polling."
	].join("\n");
}
