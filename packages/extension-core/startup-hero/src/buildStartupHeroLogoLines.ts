/**
 * Builds the startup hero lines as a Nexus block wordmark with a readable N glyph.
 *
 * @param theme UI theme formatter.
 * @returns Styled startup hero lines.
 */
export function buildStartupHeroLogoLines(theme: {
	fg(name: string, value: string): string;
}): string[] {
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
