import { writeTetrisSettings } from "../settings/writeTetrisSettings";

/**
 * Persists the Tetris music preference under ~/.config/nexus/config.json.
 *
 * @param enabled Whether music should auto-start.
 */
export function writeTetrisMusicPreference(enabled: boolean): void {
	writeTetrisSettings({ musicEnabled: enabled });
}
