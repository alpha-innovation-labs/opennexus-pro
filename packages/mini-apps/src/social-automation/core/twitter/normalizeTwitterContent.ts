/**
 * Normalizes RSS title text into display content.
 *
 * @param account Bare account handle.
 * @param title RSS item title.
 * @returns Human-readable content.
 */
export function normalizeTwitterContent(account: string, title: string): string {
	const repostPrefix = `RT by @${account}:`;
	const content = title.startsWith(repostPrefix) ? title.slice(repostPrefix.length) : title;
	return content.replace(/\s+/gu, " ").trim();
}
