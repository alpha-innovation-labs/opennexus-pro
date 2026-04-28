/**
 * Builds the startup logo lines as a Nexus block wordmark with a readable N glyph.
 *
 * @param theme UI theme formatter.
 * @returns Styled startup logo lines.
 */
export function buildStartupLogoLines(theme: { fg(name: string, value: string): string }): string[] {
	const lines = [
		"███╗   ██╗███████╗██╗  ██╗██╗   ██╗███████╗",
		"████╗  ██║██╔════╝╚██╗██╔╝██║   ██║██╔════╝",
		"██╔██╗ ██║█████╗   ╚███╔╝ ██║   ██║███████╗",
		"██║╚██╗██║██╔══╝   ██╔██╗ ██║   ██║╚════██║",
		"██║ ╚████║███████╗██╔╝ ██╗╚██████╔╝███████║",
		"╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝",
	];
	return lines.map((line) => theme.fg("accent", line));
}
