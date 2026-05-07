import { readTetrisSettings } from "../settings/readTetrisSettings.js";

/**
 * Reads the persisted Tetris music preference from Nexus config.
 *
 * @returns Persisted music preference, defaulting to enabled.
 */
export function readTetrisMusicPreference(): boolean {
	return readTetrisSettings().musicEnabled;
}
