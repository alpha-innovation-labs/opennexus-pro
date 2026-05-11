import { getSocialAutomationAudioRootPath } from "../paths/getSocialAutomationAudioRootPath.js";
import { getSocialAutomationDbPath } from "../paths/getSocialAutomationDbPath.js";
import { withSocialAutomationDatabase } from "./withSocialAutomationDatabase.js";

export type SocialAutomationStatus = { dbPath: string; audioDir: string; twitterPosts: number; youtubeUploads: number; youtubeAudioFiles: number };

/**
 * Reads high-level social automation storage status.
 *
 * @param input Optional path overrides.
 * @returns Status counts and paths.
 */
export function readSocialAutomationStatus(input: { dbPath?: string; audioDir?: string } = {}): SocialAutomationStatus {
	return withSocialAutomationDatabase(input.dbPath, (db) => ({
		dbPath: getSocialAutomationDbPath(input.dbPath),
		audioDir: getSocialAutomationAudioRootPath(input.audioDir),
		twitterPosts: readCount(db, "twitter_posts"),
		youtubeUploads: readCount(db, "youtube_uploads"),
		youtubeAudioFiles: readCountWhere(db, "youtube_uploads", "audio_file_path IS NOT NULL"),
	}));
}

/** Reads a table count. */
function readCount(db: { prepare: (sql: string) => { get: () => unknown } }, table: string): number {
	return Number((db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get() as { count?: number }).count ?? 0);
}

/** Reads a table count with a static where clause. */
function readCountWhere(db: { prepare: (sql: string) => { get: () => unknown } }, table: string, where: string): number {
	return Number((db.prepare(`SELECT COUNT(*) AS count FROM ${table} WHERE ${where}`).get() as { count?: number }).count ?? 0);
}
