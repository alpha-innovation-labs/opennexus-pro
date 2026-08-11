export type TwoPaneFooterOptions = {
	bottomPrefix: string;
	bottomTitle?: string;
	bottomValue: string;
};

/**
 * Creates footer lines for the shared modal two-pane wrapper.
 *
 * @param options Footer options.
 * @returns Footer lines.
 */
export function createTwoPaneFooterLine(
	options: TwoPaneFooterOptions,
): string[] {
	return options.bottomTitle
		? [`${options.bottomTitle} ${options.bottomPrefix}${options.bottomValue}`]
		: [];
}
