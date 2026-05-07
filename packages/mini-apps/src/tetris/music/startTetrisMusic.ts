import { spawn, type ChildProcess } from "node:child_process";
import { getTetrisMusicAssetPath } from "./getTetrisMusicAssetPath.js";

/**
 * Starts looping the Tetris music through the macOS audio player.
 *
 * @returns Child process for the loop, or null when audio is unavailable.
 */
export function startTetrisMusic(): ChildProcess | null {
	const assetPath = getTetrisMusicAssetPath();
	if (!assetPath || process.platform !== "darwin") return null;
	return spawn("bash", ["-lc", "while true; do afplay \"$0\" || exit 0; done", assetPath], {
		detached: true,
		stdio: "ignore",
	});
}
