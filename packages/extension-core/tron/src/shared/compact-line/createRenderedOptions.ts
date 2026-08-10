/**
 * Chooses the rendered option segment for one compact line.
 *
 * @param shownOptions Truncated plain option text.
 * @param renderedOptions Optional pre-colored option text.
 * @param theme UI theme.
 * @returns Rendered option segment.
 */
export function createRenderedOptions(
	shownOptions: string,
	renderedOptions: string | undefined,
	theme: { fg(color: string, value: string): string },
): string {
	if (!shownOptions) return "";
	return renderedOptions ?? theme.fg("dim", shownOptions);
}
