import { readNexusUserConfig } from "@nexus/runtime/config/readNexusUserConfig";
import { writeNexusUserConfig } from "@nexus/runtime/config/writeNexusUserConfig";
import type { TetrisSettings } from "./readTetrisSettings";

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
