/**
 * Creates help text for the Nexus annotation mini-app command surface.
 *
 * @returns Annotation daemon usage text.
 */
export function createAnnotationUsageText(): string {
	return [
		"Usage: nexus annotation <start|stop|restart|status|logs>",
		"",
		"Commands:",
		"  start     Start the background annotation daemon",
		"  stop      Stop the background annotation daemon",
		"  restart   Restart the background annotation daemon",
		"  status    Show annotation daemon status",
		"  logs      Print the annotation daemon log path and recent lines",
		"",
		"The annotation daemon stores browser feedback and supports claim/resolve tools.",
	].join("\n");
}
