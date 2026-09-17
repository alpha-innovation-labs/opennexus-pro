import { Markdown } from "@earendil-works/pi-tui";

type MarkdownToken = {
	type: string;
	depth?: number;
	tokens?: unknown[];
};

type MarkdownStyleContext = {
	applyText: (text: string) => string;
	stylePrefix: string;
};

type MarkdownRenderTokenThis = {
	__nexusMarkdownHeadingPatched__?: boolean;
	renderToken(
		token: MarkdownToken,
		width: number,
		nextTokenType: string | undefined,
		styleContext: MarkdownStyleContext,
	): unknown[];
};

/**
 * Patches the Markdown component so H3 and deeper headings render
 * identically to H2.
 *
 * pi-tui already applies the same style (bold + heading color) to H2 and H3.
 * The only difference is that headings at depth >= 3 prepend the raw hash
 * prefix (e.g. "### "). That prefix looks noisy in assistant messages.
 *
 * Normalising depth to 2 removes the prefix while keeping the style
 * unchanged.
 */
export function applyMarkdownHeadingLevelPatch(): void {
	const prototype = Markdown.prototype as unknown as MarkdownRenderTokenThis;
	if (prototype.__nexusMarkdownHeadingPatched__) return;

	const originalRenderToken = prototype.renderToken;
	prototype.renderToken = function renderToken(
		this: MarkdownRenderTokenThis,
		token: MarkdownToken,
		width: number,
		nextTokenType: string | undefined,
		styleContext: MarkdownStyleContext,
	): unknown[] {
		if (token.type === "heading" && (token.depth ?? 1) >= 3) {
			token.depth = 2;
		}
		return originalRenderToken.call(
			this,
			token,
			width,
			nextTokenType,
			styleContext,
		);
	};

	prototype.__nexusMarkdownHeadingPatched__ = true;
}
