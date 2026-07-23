import type { TwitterPostType } from "./TwitterPostRecord.js";

/**
 * Classifies a Nitter RSS title using known title prefixes.
 *
 * @param account Bare account handle.
 * @param title RSS item title.
 * @returns Best-effort post type.
 */
export function classifyTwitterItem(account: string, title: string): TwitterPostType {
	if (title.startsWith(`RT by @${account}:`)) return "repost";
	if (title.startsWith("R to @")) return "reply";
	return "post";
}
