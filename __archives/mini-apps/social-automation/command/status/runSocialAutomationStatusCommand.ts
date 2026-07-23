import { hasFlag } from "../hasFlag.js";
import { readFlagValue } from "../readFlagValue.js";
import { readSocialAutomationStatus } from "../../core/storage/readSocialAutomationStatus.js";

/**
 * Runs the social automation status command.
 *
 * @param argv Raw CLI args.
 * @returns Exit code.
 */
export function runSocialAutomationStatusCommand(argv: readonly string[]): number {
	const status = readSocialAutomationStatus({ dbPath: readFlagValue(argv, "--db"), audioDir: readFlagValue(argv, "--audio-dir") });
	if (hasFlag(argv, "--json")) console.log(JSON.stringify(status, null, 2));
	else {
		console.log(`DB: ${status.dbPath}`);
		console.log(`Audio: ${status.audioDir}`);
		console.log(`Twitter posts: ${status.twitterPosts}`);
		console.log(`YouTube uploads: ${status.youtubeUploads}`);
		console.log(`YouTube audio files: ${status.youtubeAudioFiles}`);
	}
	return 0;
}
