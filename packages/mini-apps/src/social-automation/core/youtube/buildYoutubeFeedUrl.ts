/**
 * Builds a YouTube RSS feed URL for a channel id.
 *
 * @param channelId YouTube channel id.
 * @param feedBase Optional fixture feed base.
 * @returns Feed URL.
 */
export function buildYoutubeFeedUrl(channelId: string, feedBase?: string): string {
	const url = new URL(feedBase ?? "https://www.youtube.com/feeds/videos.xml");
	url.searchParams.set("channel_id", channelId);
	return url.toString();
}
