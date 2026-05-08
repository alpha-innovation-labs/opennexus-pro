/**
 * Pads pane lines so tui-kit modal body does not need global scrolling.
 *
 * @param lines Visible pane lines.
 * @param height Target pane height.
 * @returns Lines padded to the target height.
 */
export function padPaneLinesToHeight(lines: readonly string[], height: number): string[] {
	return [...lines.slice(0, height), ...Array.from({ length: Math.max(0, height - lines.length) }, () => "")];
}
