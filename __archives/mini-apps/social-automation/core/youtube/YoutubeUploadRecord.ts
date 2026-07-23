export type YoutubeUploadType = "video" | "short" | "unknown";

/** Parsed YouTube upload ready for SQLite persistence. */
export type YoutubeUploadRecord = {
	source: string;
	channelInput: string;
	channelTitle?: string;
	channelUrl?: string;
	channelId?: string;
	videoId: string;
	type: YoutubeUploadType;
	title: string;
	publishedAt?: string;
	videoUrl: string;
	durationSeconds?: number;
	audioFilePath?: string;
	audioDownloadedAt?: string;
	fetchedAt: string;
};
