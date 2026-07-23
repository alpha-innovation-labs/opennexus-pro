const TWITTER_HANDLE_PATTERN = /^[A-Za-z0-9_]{1,15}$/u;

/**
 * Normalizes a Twitter/X account argument to a bare handle.
 *
 * @param value Raw handle or profile URL.
 * @returns Bare handle without @.
 */
export function normalizeTwitterAccount(value: string): string {
	const trimmed = value.trim();
	const fromUrl = tryReadHandleFromUrl(trimmed);
	const handle = (fromUrl ?? trimmed).replace(/^@/u, "");
	if (!TWITTER_HANDLE_PATTERN.test(handle)) throw new Error(`Invalid Twitter account: ${value}`);
	return handle;
}

/** Reads a handle from an X/Twitter/Nitter profile URL. */
function tryReadHandleFromUrl(value: string): string | undefined {
	try {
		const url = new URL(value);
		if (!["x.com", "twitter.com", "nitter.net"].includes(url.hostname)) return undefined;
		return url.pathname.split("/").filter(Boolean)[0];
	} catch {
		return undefined;
	}
}
