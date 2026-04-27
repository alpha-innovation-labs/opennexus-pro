/**
 * Compact tool-call summary text.
 */
export interface SummaryText {
	main: string;
	options: string;
	inlineStats?: string;
	renderedInlineStats?: string;
	renderedOptions?: string;
}
