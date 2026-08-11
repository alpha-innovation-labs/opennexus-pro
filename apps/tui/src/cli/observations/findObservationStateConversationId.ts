import { readdir } from "node:fs/promises";
import { stripObservationStateExtension } from "./stripObservationStateExtension";

/**
 * Finds a stored observation conversation id by exact id or session-id suffix.
 *
 * @param observationsDir Directory containing observation state files.
 * @param sanitizedSessionId Session id normalized for file names.
 * @returns Matching conversation id when one exists.
 */
export async function findObservationStateConversationId(
	observationsDir: string,
	sanitizedSessionId: string,
): Promise<string | undefined> {
	try {
		const fileNames = await readdir(observationsDir);
		const exactFileNames = [
			`${sanitizedSessionId}.json`,
			`${sanitizedSessionId}.state.json`,
		];
		if (exactFileNames.some((fileName) => fileNames.includes(fileName)))
			return sanitizedSessionId;
		const suffixes = [
			`_${sanitizedSessionId}.json`,
			`_${sanitizedSessionId}.state.json`,
		];
		const matchingFileName = fileNames.find((fileName) =>
			suffixes.some((suffix) => fileName.endsWith(suffix)),
		);
		return matchingFileName
			? stripObservationStateExtension(matchingFileName)
			: undefined;
	} catch {
		return undefined;
	}
}
