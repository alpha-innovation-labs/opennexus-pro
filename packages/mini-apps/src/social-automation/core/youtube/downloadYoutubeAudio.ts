import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readdir, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const VIDEO_ID_PATTERN = /^[-_A-Za-z0-9]{6,32}$/u;

/**
 * Downloads YouTube audio with yt-dlp into the configured audio root.
 *
 * @param input Download options.
 * @returns Final audio file path.
 */
export async function downloadYoutubeAudio(input: { videoId: string; videoUrl: string; audioRoot: string; ytDlpPath?: string; timeoutMs?: number }): Promise<string> {
	if (!VIDEO_ID_PATTERN.test(input.videoId)) throw new Error(`Unsafe YouTube video id: ${input.videoId}`);
	const videoDirectory = resolve(input.audioRoot, input.videoId);
	const root = resolve(input.audioRoot);
	if (!videoDirectory.startsWith(`${root}/`) && videoDirectory !== root) throw new Error("Audio output path escaped audio root");
	await mkdir(videoDirectory, { recursive: true, mode: 0o700 });
	const existing = await findAudioFile(videoDirectory, input.videoId);
	if (existing) return existing;
	await execFileAsync(input.ytDlpPath ?? "yt-dlp", [
		"--audio-format", "mp3",
		"--extract-audio",
		"--no-playlist",
		"--output", join(videoDirectory, `${input.videoId}.%(ext)s`),
		input.videoUrl,
	], { timeout: input.timeoutMs ?? 5 * 60 * 1000 });
	const audioFile = await findAudioFile(videoDirectory, input.videoId);
	if (!audioFile) throw new Error(`yt-dlp finished without producing audio for ${input.videoId}`);
	return audioFile;
}

/** Finds a verified audio file produced for a video id. */
async function findAudioFile(directory: string, videoId: string): Promise<string | undefined> {
	if (!existsSync(directory)) return undefined;
	for (const file of await readdir(directory)) {
		if (!file.startsWith(`${videoId}.`)) continue;
		const filePath = join(directory, file);
		if ((await stat(filePath)).isFile()) return filePath;
	}
	return undefined;
}
