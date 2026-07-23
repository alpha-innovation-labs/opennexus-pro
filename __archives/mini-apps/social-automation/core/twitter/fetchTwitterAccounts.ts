import { insertTwitterPost } from "../storage/insertTwitterPost.js";
import { withSocialAutomationDatabase } from "../storage/withSocialAutomationDatabase.js";
import { fetchText } from "../shared/fetchText.js";
import { buildNitterRssUrl } from "./buildNitterRssUrl.js";
import { normalizeTwitterAccount } from "./normalizeTwitterAccount.js";
import { parseNitterRssItems } from "./parseNitterRssItems.js";

export type TwitterFetchSummary = { accounts: number; fetched: number; inserted: number; skipped: number; failures: { account: string; error: string }[] };

/**
 * Fetches and persists latest Nitter RSS items for accounts.
 *
 * @param input Fetch options.
 * @returns Aggregate fetch summary.
 */
export async function fetchTwitterAccounts(input: { accounts: string[]; dbPath?: string; nitterBase?: string; limit?: number }): Promise<TwitterFetchSummary> {
	const summary: TwitterFetchSummary = { accounts: input.accounts.length, fetched: 0, inserted: 0, skipped: 0, failures: [] };
	const nitterBase = input.nitterBase ?? "https://nitter.net";
	for (const rawAccount of input.accounts) {
		try {
			const account = normalizeTwitterAccount(rawAccount);
			const fetchedAt = new Date().toISOString();
			const xml = await fetchText(buildNitterRssUrl(nitterBase, account));
			const posts = parseNitterRssItems(xml, account, new URL(nitterBase).hostname, fetchedAt).slice(0, input.limit);
			summary.fetched += posts.length;
			withSocialAutomationDatabase(input.dbPath, (db) => {
				for (const post of posts) {
					if (insertTwitterPost(db, post)) summary.inserted += 1;
					else summary.skipped += 1;
				}
			});
		} catch (error) {
			summary.failures.push({ account: rawAccount, error: error instanceof Error ? error.message : String(error) });
		}
	}
	return summary;
}
