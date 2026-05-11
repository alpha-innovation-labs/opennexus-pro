/**
 * Builds a Nitter RSS URL for a normalized account.
 *
 * @param nitterBase Base Nitter instance URL.
 * @param account Bare account handle.
 * @returns RSS URL.
 */
export function buildNitterRssUrl(nitterBase: string, account: string): string {
	const base = new URL(nitterBase);
	base.pathname = `/${account}/rss`;
	base.search = "";
	return base.toString();
}
