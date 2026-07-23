const CHANNEL_ID_PATTERN = /^UC[-_A-Za-z0-9]{22}$/u;

/**
 * Normalizes YouTube channel input into a URL or handle string.
 *
 * @param value Raw channel argument.
 * @returns Trimmed input.
 */
export function normalizeYoutubeChannelInput(value: string): string {
	const trimmed = value.trim();
	if (!trimmed) throw new Error("YouTube channel input cannot be empty");
	if (trimmed.startsWith("@") || CHANNEL_ID_PATTERN.test(trimmed)) return trimmed;
	const url = new URL(trimmed);
	if (!url.hostname.endsWith("youtube.com")) throw new Error(`Unsupported YouTube host: ${url.hostname}`);
	return url.toString();
}

/** Reports whether a value is a YouTube channel id. */
export function isYoutubeChannelId(value: string): boolean {
	return CHANNEL_ID_PATTERN.test(value);
}
