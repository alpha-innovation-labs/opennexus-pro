import { getLinkedomDOMParser } from "../xml/getLinkedomDOMParser.js";
import { classifyTwitterItem } from "./classifyTwitterItem.js";
import { extractStatusId } from "./extractStatusId.js";
import { normalizeTwitterContent } from "./normalizeTwitterContent.js";
import type { TwitterPostRecord } from "./TwitterPostRecord.js";

/**
 * Parses Nitter RSS XML into Twitter post records.
 *
 * @param xml RSS XML text.
 * @param account Bare account handle.
 * @param source Source label.
 * @param fetchedAt Fetch timestamp.
 * @returns Parsed post records.
 */
export function parseNitterRssItems(xml: string, account: string, source: string, fetchedAt: string): TwitterPostRecord[] {
	const DOMParser = getLinkedomDOMParser();
	const document = new DOMParser().parseFromString(xml, "text/xml");
	if (!document) throw new Error("Nitter RSS XML could not be parsed");
	return Array.from(document.querySelectorAll("item") as unknown as Element[]).flatMap((item) => {
		const rawTitle = readText(item, "title");
		const guid = readText(item, "guid");
		const link = readText(item, "link");
		if (!rawTitle || !guid) return [];
		return [{
			source,
			account: `@${account}`,
			statusId: extractStatusId(guid, link),
			type: classifyTwitterItem(account, rawTitle),
				author: readChildText(item, "creator") || undefined,
			postedAt: normalizeDate(readText(item, "pubDate")),
			url: link ? link.replace("https://nitter.net", "https://x.com").replace(/#m$/u, "") : undefined,
			content: normalizeTwitterContent(account, rawTitle),
			rawTitle,
			rawDescription: readText(item, "description") || undefined,
			fetchedAt,
		}];
	});
}

/** Reads text content for the first matching selector. */
function readText(item: Element, selector: string): string {
	return item.querySelector(selector)?.textContent?.trim() ?? "";
}

/** Reads text content by local child element name. */
function readChildText(item: Element, localName: string): string {
	return Array.from(item.children).find((child) => child.localName.split(":").at(-1) === localName)?.textContent?.trim() ?? "";
}

/** Converts parseable dates to ISO while preserving invalid blanks. */
function normalizeDate(value: string): string | undefined {
	const timestamp = Date.parse(value);
	return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : undefined;
}
