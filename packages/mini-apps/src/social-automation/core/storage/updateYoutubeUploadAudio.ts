import type { SocialAutomationDatabase } from "../shared/SocialAutomationDatabase.js";

/**
 * Stores the final audio artifact path for a YouTube upload.
 *
 * @param db SQLite database handle.
 * @param videoId YouTube video id.
 * @param audioFilePath Final audio file path.
 * @param downloadedAt Download completion timestamp.
 */
export function updateYoutubeUploadAudio(db: SocialAutomationDatabase, videoId: string, audioFilePath: string, downloadedAt: string): void {
	db.prepare("UPDATE youtube_uploads SET audio_file_path = ?, audio_downloaded_at = ? WHERE video_id = ?").run(audioFilePath, downloadedAt, videoId);
}
