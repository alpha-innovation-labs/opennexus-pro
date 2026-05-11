import { requireWebFetchPackage } from "./requireWebFetchPackage.js";

type TurndownServiceConstructor = new (options: {
	headingStyle: "atx";
	hr: "---";
	bulletListMarker: "-";
	codeBlockStyle: "fenced";
	emDelimiter: "*";
}) => {
	remove(tags: string[]): void;
	turndown(html: string): string;
};

/**
 * Converts HTML into markdown using the same core behavior as OpenCode webfetch.
 *
 * @param html HTML document text.
 * @returns Markdown representation of the document.
 */
export function convertHtmlToMarkdown(html: string): string {
	const TurndownService = requireWebFetchPackage<TurndownServiceConstructor>("turndown");
	const turndownService = new TurndownService({
		headingStyle: "atx",
		hr: "---",
		bulletListMarker: "-",
		codeBlockStyle: "fenced",
		emDelimiter: "*",
	});
	turndownService.remove(["script", "style", "meta", "link"]);
	return turndownService.turndown(html);
}
