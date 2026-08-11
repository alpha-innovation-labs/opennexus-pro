import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { getObservationPromptOverridePath } from "./getObservationPromptOverridePath";

/**
 * Writes or clears the observation prompt override.
 *
 * @param content Prompt override text; blank content clears the override.
 */
export async function writeObservationPromptOverride(
	content: string,
): Promise<void> {
	const path = getObservationPromptOverridePath();
	const trimmed = content.trim();
	if (!trimmed) {
		await rm(path, { force: true });
		return;
	}
	await mkdir(dirname(path), { recursive: true });
	await writeFile(path, `${trimmed}\n`, "utf8");
}
