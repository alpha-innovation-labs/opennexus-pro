import { readNexusUserConfig } from "@nexus/runtime/config/readNexusUserConfig.js";
import { writeNexusUserConfig } from "@nexus/runtime/config/writeNexusUserConfig.js";
import type { TetrisSettings } from "./readTetrisSettings.js";

/**
 * Writes partial Tetris settings under ~/.config/nexus/config.json.
 *
 * @param settings Partial Tetris settings to merge.
 */
export function writeTetrisSettings(settings: Partial<TetrisSettings>): void {
	const config = readNexusUserConfig();
	writeNexusUserConfig({
		...config,
		miniApps: {
			...config.miniApps,
			tetris: {
				...config.miniApps?.tetris,
				...settings,
			},
		},
	});
}
