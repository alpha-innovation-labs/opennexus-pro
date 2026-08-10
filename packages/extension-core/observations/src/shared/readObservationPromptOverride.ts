import { readFile } from "node:fs/promises";
import { getObservationPromptOverridePath } from "./getObservationPromptOverridePath";

/**
 * Reads the persisted observation prompt override.
 *
 * @returns Override text when configured.
 */
export async function readObservationPromptOverride(): Promise<string | undefined> {
	try {
		const content = (await readFile(getObservationPromptOverridePath(), "utf8")).trim();
		return content.length > 0 ? content : undefined;
	} catch {
		return undefined;
	}
}
