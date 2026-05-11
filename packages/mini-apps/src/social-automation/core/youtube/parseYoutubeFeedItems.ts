import { DOMParser } from "linkedom";
import type { YoutubeChannelFeed } from "./YoutubeChannelFeed.js";
import type { YoutubeUploadRecord } from "./YoutubeUploadRecord.js";

/**
 * Parses YouTube Atom feed XML into upload records.
 *
 * @param xml Feed XML text.
 * @param feed Resolved feed metadata.
 * @param fetchedAt Fetch timestamp.
 * @returns Parsed upload records.
 */
export function parseYoutubeFeedItems(xml: string, feed: YoutubeChannelFeed, fetchedAt: string): YoutubeUploadRecord[] {
	const document = new DOMParser().parseFromString(xml, "text/xml");
	if (!document) throw new Error("YouTube feed XML could not be parsed");
	return Array.from(document.querySelectorAll("entry") as unknown as Element[]).flatMap((entry) => {
		const videoId = readChildText(entry, "videoId");
		const title = readChildText(entry, "title");
		if (!videoId || !title) return [];
		return [{
			source: "youtube-rss",
			channelInput: feed.channelInput,
			channelTitle: readNestedText(entry, "author", "name") || undefined,
			channelUrl: readNestedText(entry, "author", "uri") || feed.channelUrl,
			channelId: readChildText(entry, "channelId") || feed.channelId,
			videoId,
			type: "unknown" as const,
			title,
			publishedAt: normalizeDate(readChildText(entry, "published")),
			videoUrl: readLink(entry) || `https://www.youtube.com/watch?v=${videoId}`,
			fetchedAt,
		}];
	});
}

/** Reads direct child text by local element name. */
function readChildText(element: Element, localName: string): string {
	return Array.from(element.children).find((child) => child.localName.split(":").at(-1) === localName)?.textContent?.trim() ?? "";
}

/** Reads nested child text by local element names. */
function readNestedText(element: Element, parentName: string, childName: string): string {
	const parent = Array.from(element.children).find((child) => child.localName === parentName);
	return parent ? readChildText(parent, childName) : "";
}

/** Reads the alternate link href from an entry. */
function readLink(entry: Element): string | undefined {
	return Array.from(entry.querySelectorAll("link") as unknown as Element[]).find((link) => link.getAttribute("href"))?.getAttribute("href") ?? undefined;
}

/** Converts parseable dates to ISO timestamps. */
function normalizeDate(value: string): string | undefined {
	const timestamp = Date.parse(value);
	return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : undefined;
}
