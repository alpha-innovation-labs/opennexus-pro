import { readTetrisMusicPreference } from "./readTetrisMusicPreference.js";
import { writeTetrisMusicPreference } from "./writeTetrisMusicPreference.js";

let musicEnabled: boolean | undefined;

/**
 * Returns the remembered Tetris music preference for this app process and disk.
 *
 * @returns True when Tetris music should auto-start.
 */
export function getTetrisMusicPreference(): boolean {
	musicEnabled ??= readTetrisMusicPreference();
	return musicEnabled;
}

/**
 * Stores the Tetris music preference for later panel opens and app restarts.
 *
 * @param enabled Whether Tetris music should auto-start.
 */
export function setTetrisMusicPreference(enabled: boolean): void {
	musicEnabled = enabled;
	writeTetrisMusicPreference(enabled);
}
