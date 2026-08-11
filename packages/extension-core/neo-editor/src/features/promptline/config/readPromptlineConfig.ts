import { readNeoConfig } from "../../../readNeoConfig";
import { readEditorTriggerConfig } from "../../editor-triggers/readEditorTriggerConfig";
import type { PromptlineConfig } from "./types";

/**
 * Reads the promptline trigger and Neo config from disk.
 *
 * @param cwd Project working directory.
 * @returns Promptline config loaded for the session.
 */
export async function readPromptlineConfig(
	cwd: string,
): Promise<PromptlineConfig> {
	const [triggerConfig, neoConfig] = await Promise.all([
		readEditorTriggerConfig(cwd),
		readNeoConfig(cwd),
	]);

	return {
		triggerConfig,
		neoConfig,
	};
}
