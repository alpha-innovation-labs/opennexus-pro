const CHANNEL_ID_PATTERN = /UC[-_A-Za-z0-9]{22}/u;

/**
 * Extracts a YouTube channel id from public channel HTML.
 *
 * @param html Channel page HTML.
 * @returns Channel id when present.
 */
export function extractChannelIdFromHtml(html: string): string | undefined {
	return html.match(CHANNEL_ID_PATTERN)?.[0];
}
