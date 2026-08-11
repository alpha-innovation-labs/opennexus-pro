/**
 * Creates the shared Asciinema options for showcase terminal recordings.
 *
 * @returns Player options compatible with the bundled Asciinema runtime.
 */
export function createShowcasePlayerOptions(): Record<string, unknown> {
	return {
		autoPlay: true,
		loop: true,
		preload: true,
		theme: "ayu",
		fit: "width",
		terminalFontSize: "small",
		terminalLineHeight: 1.05,
		terminalFontFamily:
			"JetBrainsMono Nerd Font, Geist Mono, ui-monospace, SFMono-Regular, Menlo, monospace",
	};
}
