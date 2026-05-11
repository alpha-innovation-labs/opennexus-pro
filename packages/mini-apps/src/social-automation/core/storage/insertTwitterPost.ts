import type { TwitterPostRecord } from "../twitter/TwitterPostRecord.js";
import type { SocialAutomationDatabase } from "../shared/SocialAutomationDatabase.js";

/**
 * Inserts a Twitter post, ignoring duplicate status IDs.
 *
 * @param db SQLite database handle.
 * @param post Parsed post record.
 * @returns True when inserted, false when skipped as duplicate.
 */
export function insertTwitterPost(db: SocialAutomationDatabase, post: TwitterPostRecord): boolean {
	const result = db.prepare(`
		INSERT OR IGNORE INTO twitter_posts
		(source, account, status_id, type, author, posted_at, url, content, raw_title, raw_description, fetched_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`).run(post.source, post.account, post.statusId, post.type, post.author ?? null, post.postedAt ?? null, post.url ?? null, post.content, post.rawTitle, post.rawDescription ?? null, post.fetchedAt) as { changes?: number };
	return Number(result.changes ?? 0) > 0;
}
