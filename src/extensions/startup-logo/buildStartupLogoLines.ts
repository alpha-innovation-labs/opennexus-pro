/**
 * Builds the startup logo lines as a compact Nexus wordmark.
 *
 * @param theme UI theme formatter.
 * @returns Styled startup logo lines.
 */
export function buildStartupLogoLines(theme: { fg(name: string, value: string): string }): string[] {
	const lines = [
		String.raw`_   _  _____ __  __ _   _  ____ `,
		String.raw`| \ | || ____|\ \/ /| | | |/ ___|`,
		String.raw`|  \| ||  _|   \  / | | | |\___ \ `,
		String.raw`| |\  || |___  /  \ | |_| | ___) |`,
		String.raw`|_| \_||_____|/_/\_\ \___/ |____/ `,
	];
	return lines.map((line) => theme.fg("accent", line));
}
