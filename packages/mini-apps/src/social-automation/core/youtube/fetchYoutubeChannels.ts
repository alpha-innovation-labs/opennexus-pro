import { mkdirSync } from "node:fs";
import { getSocialAutomationAudioRootPath } from "../paths/getSocialAutomationAudioRootPath.js";
import { insertYoutubeUpload } from "../storage/insertYoutubeUpload.js";
import { updateYoutubeUploadAudio } from "../storage/updateYoutubeUploadAudio.js";
import { withSocialAutomationDatabase } from "../storage/withSocialAutomationDatabase.js";
import { fetchText } from "../shared/fetchText.js";
import { downloadYoutubeAudio } from "./downloadYoutubeAudio.js";
import { parseYoutubeFeedItems } from "./parseYoutubeFeedItems.js";
import { resolveYoutubeChannelFeed } from "./resolveYoutubeChannelFeed.js";

export type YoutubeFetchSummary = { channels: number; fetched: number; inserted: number; skipped: number; downloaded: number; failures: { channel: string; error: string }[] };

/**
 * Fetches and persists latest YouTube uploads for channels.
 *
 * @param input Fetch options.
 * @returns Aggregate fetch summary.
 */
export async function fetchYoutubeChannels(input: { channels: string[]; dbPath?: string; audioDir?: string; downloadAudio: boolean; maxDownloads?: number; ytDlpPath?: string; feedBase?: string; pageBase?: string }): Promise<YoutubeFetchSummary> {
	const summary: YoutubeFetchSummary = { channels: input.channels.length, fetched: 0, inserted: 0, skipped: 0, downloaded: 0, failures: [] };
	const audioRoot = getSocialAutomationAudioRootPath(input.audioDir);
	mkdirSync(audioRoot, { recursive: true, mode: 0o700 });
	for (const channel of input.channels) {
		try {
			const feed = await resolveYoutubeChannelFeed(channel, { feedBase: input.feedBase, pageBase: input.pageBase });
			const uploads = parseYoutubeFeedItems(await fetchText(feed.feedUrl), feed, new Date().toISOString());
			summary.fetched += uploads.length;
			const insertedUploads = withSocialAutomationDatabase(input.dbPath, (db) => uploads.filter((upload) => {
				if (insertYoutubeUpload(db, upload)) {
					summary.inserted += 1;
					return true;
				}
				summary.skipped += 1;
				return false;
			}));
			if (input.downloadAudio) await downloadInsertedUploads(insertedUploads.slice(0, input.maxDownloads ?? 5), audioRoot, input, summary);
		} catch (error) {
			summary.failures.push({ channel, error: error instanceof Error ? error.message : String(error) });
		}
	}
	return summary;
}

/** Downloads audio for newly inserted upload records. */
async function downloadInsertedUploads(uploads: { videoId: string; videoUrl: string }[], audioRoot: string, input: { dbPath?: string; ytDlpPath?: string }, summary: YoutubeFetchSummary): Promise<void> {
	for (const upload of uploads) {
		const audioPath = await downloadYoutubeAudio({ videoId: upload.videoId, videoUrl: upload.videoUrl, audioRoot, ytDlpPath: input.ytDlpPath });
		withSocialAutomationDatabase(input.dbPath, (db) => updateYoutubeUploadAudio(db, upload.videoId, audioPath, new Date().toISOString()));
		summary.downloaded += 1;
	}
}
