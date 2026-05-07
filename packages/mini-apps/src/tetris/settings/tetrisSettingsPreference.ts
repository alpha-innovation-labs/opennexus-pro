import { readTetrisSettings, type TetrisSettings } from "./readTetrisSettings.js";
import { writeTetrisSettings } from "./writeTetrisSettings.js";

let cachedSettings: TetrisSettings | undefined;

/**
 * Returns cached Tetris settings loaded from disk on first use.
 *
 * @returns Tetris settings.
 */
export function getTetrisSettingsPreference(): TetrisSettings {
	cachedSettings ??= readTetrisSettings();
	return cachedSettings;
}

/**
 * Updates cached and persisted Tetris settings.
 *
 * @param settings Partial Tetris settings.
 */
export function setTetrisSettingsPreference(settings: Partial<TetrisSettings>): void {
	cachedSettings = { ...getTetrisSettingsPreference(), ...settings };
	writeTetrisSettings(settings);
}
