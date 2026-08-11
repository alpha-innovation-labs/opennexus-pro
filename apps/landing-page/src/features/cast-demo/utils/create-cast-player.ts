/**
 * Mounts the Asciinema player into the supplied terminal element.
 *
 * @param target Player mount element.
 */
export function createCastPlayer(target: HTMLElement): void {
	window.AsciinemaPlayer?.create(
		target.dataset.castSrc || "/recordings/demo.cast",
		target,
		{
			autoPlay: true,
			loop: true,
			preload: true,
			startAt: 2,
			theme: "ayu",
			fit: "width",
			terminalFontSize: "small",
			terminalLineHeight: 1.05,
			terminalFontFamily:
				"JetBrainsMono Nerd Font, Geist Mono, ui-monospace, SFMono-Regular, Menlo, monospace",
		},
	);
}
