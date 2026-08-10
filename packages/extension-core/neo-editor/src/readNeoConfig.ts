import { readFile } from "node:fs/promises";
import { getNeoConfigPath } from "./getNeoConfigPath";
import type { NeoConfig } from "./types";

const DEFAULT_NEO_CONFIG: NeoConfig = {
	clearEditorOnTriggerSubmit: true,
};

/**
 * Reads the Neo extension config.
 *
 * @param cwd Project working directory.
 * @returns Parsed Neo config with defaults.
 */
export async function readNeoConfig(cwd: string): Promise<NeoConfig> {
	try {
		const content = await readFile(getNeoConfigPath(cwd), "utf8");
		const parsed = JSON.parse(content) as Partial<NeoConfig>;
		return {
			clearEditorOnTriggerSubmit: parsed.clearEditorOnTriggerSubmit ?? DEFAULT_NEO_CONFIG.clearEditorOnTriggerSubmit,
		};
	} catch {
		return { ...DEFAULT_NEO_CONFIG };
	}
}
