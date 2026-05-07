import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const sourceAssetPath = join(dirname(fileURLToPath(import.meta.url)), "..", "assets", "za-rus.mp3");
const releaseAssetPath = join("runtime", "mini-apps", "tetris", "za-rus.mp3");

/**
 * Resolves the bundled Tetris music asset for source and release runs.
 *
 * @returns Existing MP3 path, or null when unavailable.
 */
export function getTetrisMusicAssetPath(): string | null {
	const candidates = [
		process.env.NEXUS_TETRIS_MUSIC_PATH,
		sourceAssetPath,
		resolve(releaseAssetPath),
		join(dirname(process.execPath), "package", releaseAssetPath),
		join(dirname(process.execPath), releaseAssetPath),
	].filter((value): value is string => Boolean(value));
	return candidates.find((candidate) => existsSync(candidate)) ?? null;
}
