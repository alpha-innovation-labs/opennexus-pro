import { type ChildProcess, spawn } from "node:child_process";
import { getTetrisMusicAssetPath } from "./getTetrisMusicAssetPath";
import { getTetrisMusicPlayerScript } from "./getTetrisMusicPlayerScript";

/**
 * Starts looping the Tetris music through the first available OS audio player.
 *
 * @returns Child process for the loop, or null when audio is unavailable.
 */
export function startTetrisMusic(): ChildProcess | null {
	const assetPath = getTetrisMusicAssetPath();
	const playerScript = getTetrisMusicPlayerScript();
	if (!assetPath || !playerScript) return null;
	return spawn("bash", ["-lc", playerScript, assetPath], {
		detached: true,
		stdio: "ignore",
	});
}
