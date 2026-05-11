import type { SocialAutomationDatabase } from "../shared/SocialAutomationDatabase.js";

/**
 * Creates social automation tables and indexes when missing.
 *
 * @param db SQLite database handle.
 */
export function initializeSocialAutomationSchema(db: SocialAutomationDatabase): void {
	db.exec(`
		CREATE TABLE IF NOT EXISTS twitter_posts (
			source TEXT NOT NULL,
			account TEXT NOT NULL,
			status_id TEXT NOT NULL PRIMARY KEY,
			type TEXT NOT NULL CHECK (type IN ('post', 'reply', 'repost', 'unknown')),
			author TEXT,
			posted_at TEXT,
			url TEXT,
			content TEXT NOT NULL,
			raw_title TEXT NOT NULL,
			raw_description TEXT,
			fetched_at TEXT NOT NULL
		);
		CREATE TABLE IF NOT EXISTS youtube_uploads (
			source TEXT NOT NULL,
			channel_input TEXT NOT NULL,
			channel_title TEXT,
			channel_url TEXT,
			channel_id TEXT,
			video_id TEXT NOT NULL PRIMARY KEY,
			type TEXT NOT NULL DEFAULT 'unknown' CHECK (type IN ('video', 'short', 'unknown')),
			title TEXT NOT NULL,
			published_at TEXT,
			video_url TEXT NOT NULL,
			duration_seconds INTEGER,
			audio_file_path TEXT,
			audio_downloaded_at TEXT,
			fetched_at TEXT NOT NULL
		);
		CREATE INDEX IF NOT EXISTS idx_twitter_posts_account_posted_at ON twitter_posts(account, posted_at DESC);
		CREATE INDEX IF NOT EXISTS idx_youtube_uploads_channel_published_at ON youtube_uploads(channel_id, published_at DESC);
	`);
}
