import { requireWebFetchPackage } from "./requireWebFetchPackage.js";

type LinkedomModule = {
	parseHTML(html: string): { document: Document };
};

/**
 * Extracts visible text from HTML after dropping non-content elements.
 *
 * @param html HTML document text.
 * @returns Plain text content.
 */
export function extractTextFromHtml(html: string): string {
	const { parseHTML } = requireWebFetchPackage<LinkedomModule>("linkedom");
	const { document } = parseHTML(html);
	for (const element of document.querySelectorAll("script,style,noscript,iframe,object,embed")) {
		element.remove();
	}
	return (document.body?.textContent ?? document.textContent ?? "").trim();
}
