import { fetchText } from "../shared/fetchText.js";
import { buildYoutubeFeedUrl } from "./buildYoutubeFeedUrl.js";
import { extractChannelIdFromHtml } from "./extractChannelIdFromHtml.js";
import { isYoutubeChannelId, normalizeYoutubeChannelInput } from "./normalizeYoutubeChannelInput.js";
import type { YoutubeChannelFeed } from "./YoutubeChannelFeed.js";

/**
 * Resolves channel input to a public YouTube RSS feed URL.
 *
 * @param input Raw channel input.
 * @param options Fixture and fetch options.
 * @returns Resolved feed metadata.
 */
export async function resolveYoutubeChannelFeed(input: string, options: { feedBase?: string; pageBase?: string } = {}): Promise<YoutubeChannelFeed> {
	const normalized = normalizeYoutubeChannelInput(input);
	if (isYoutubeChannelId(normalized)) return buildFeed(normalized, input, options.feedBase);
	if (normalized.startsWith("@")) return resolveHandle(normalized, input, options);
	const url = new URL(normalized);
	const segments = url.pathname.split("/").filter(Boolean);
	if (segments[0] === "channel" && segments[1] && isYoutubeChannelId(segments[1])) return buildFeed(segments[1], input, options.feedBase);
	if (segments[0]?.startsWith("@")) return resolveHandle(segments[0], input, options);
	throw new Error(`Unsupported YouTube channel URL: ${input}`);
}

/** Builds resolved feed metadata from a channel id. */
function buildFeed(channelId: string, channelInput: string, feedBase?: string): YoutubeChannelFeed {
	return { channelInput, channelId, channelUrl: `https://www.youtube.com/channel/${channelId}`, feedUrl: buildYoutubeFeedUrl(channelId, feedBase) };
}

/** Resolves a YouTube handle by reading its public page. */
async function resolveHandle(handle: string, channelInput: string, options: { feedBase?: string; pageBase?: string }): Promise<YoutubeChannelFeed> {
	const pageUrl = new URL(options.pageBase ?? "https://www.youtube.com");
	pageUrl.pathname = `/${handle}`;
	const channelId = extractChannelIdFromHtml(await fetchText(pageUrl.toString()));
	if (!channelId) throw new Error(`Could not resolve YouTube channel id for ${handle}`);
	return buildFeed(channelId, channelInput, options.feedBase);
}
