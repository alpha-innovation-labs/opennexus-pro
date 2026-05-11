import { fetchYoutubeChannels } from "../../core/youtube/fetchYoutubeChannels.js";
import { hasFlag } from "../hasFlag.js";
import { readFlagValue } from "../readFlagValue.js";
import { readRepeatedFlagValues } from "../readRepeatedFlagValues.js";

/**
 * Runs the social automation YouTube fetch command.
 *
 * @param argv Raw CLI args.
 * @returns Exit code.
 */
export async function runYoutubeFetchCommand(argv: readonly string[]): Promise<number> {
	const channels = readRepeatedFlagValues(argv, "--channel");
	if (channels.length === 0) {
		console.error("Usage: nexus social-automation youtube fetch --channel <url|@handle|channelId>");
		return 1;
	}
	const maxDownloads = readFlagValue(argv, "--max-downloads");
	const summary = await fetchYoutubeChannels({
		channels,
		dbPath: readFlagValue(argv, "--db"),
		audioDir: readFlagValue(argv, "--audio-dir"),
		downloadAudio: !hasFlag(argv, "--no-download-audio"),
		maxDownloads: maxDownloads ? Number(maxDownloads) : undefined,
		ytDlpPath: readFlagValue(argv, "--yt-dlp-path"),
		feedBase: readFlagValue(argv, "--youtube-feed-base"),
		pageBase: readFlagValue(argv, "--youtube-page-base"),
	});
	if (hasFlag(argv, "--json")) console.log(JSON.stringify(summary, null, 2));
	else console.log(`YouTube fetched=${summary.fetched} inserted=${summary.inserted} skipped=${summary.skipped} downloaded=${summary.downloaded} failures=${summary.failures.length}`);
	return summary.failures.length === channels.length ? 1 : 0;
}
