import type { YoutubeUploadRecord } from "../youtube/YoutubeUploadRecord.js";
import type { SocialAutomationDatabase } from "../shared/SocialAutomationDatabase.js";

/**
 * Inserts a YouTube upload, ignoring duplicate video IDs.
 *
 * @param db SQLite database handle.
 * @param upload Parsed upload record.
 * @returns True when inserted, false when skipped as duplicate.
 */
export function insertYoutubeUpload(db: SocialAutomationDatabase, upload: YoutubeUploadRecord): boolean {
	const result = db.prepare(`
		INSERT OR IGNORE INTO youtube_uploads
		(source, channel_input, channel_title, channel_url, channel_id, video_id, type, title, published_at, video_url, duration_seconds, audio_file_path, audio_downloaded_at, fetched_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`).run(upload.source, upload.channelInput, upload.channelTitle ?? null, upload.channelUrl ?? null, upload.channelId ?? null, upload.videoId, upload.type, upload.title, upload.publishedAt ?? null, upload.videoUrl, upload.durationSeconds ?? null, upload.audioFilePath ?? null, upload.audioDownloadedAt ?? null, upload.fetchedAt) as { changes?: number };
	return Number(result.changes ?? 0) > 0;
}
