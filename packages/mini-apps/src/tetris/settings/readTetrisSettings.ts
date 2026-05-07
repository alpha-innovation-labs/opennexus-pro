import { readNexusUserConfig } from "@nexus/runtime/config/readNexusUserConfig.js";

/** Tetris settings persisted under Nexus mini-app config. */
export type TetrisSettings = {
	fullscreen: boolean;
	musicEnabled: boolean;
};

/**
 * Reads persisted Tetris settings from Nexus user config.
 *
 * @returns Tetris settings with defaults.
 */
export function readTetrisSettings(): TetrisSettings {
	const settings = readNexusUserConfig().miniApps?.tetris;
	return {
		fullscreen: typeof settings?.fullscreen === "boolean" ? settings.fullscreen : false,
		musicEnabled: typeof settings?.musicEnabled === "boolean" ? settings.musicEnabled : true,
	};
}
