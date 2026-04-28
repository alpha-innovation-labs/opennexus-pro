import type { AuthImportSource } from "../model/AuthImportSource.js";
import type { AuthImportCandidate } from "../model/AuthImportCandidate.js";
import type { LoginImportModelRegistry } from "../model/LoginImportRegistry.js";
import { readAuthImportJson } from "../io/readAuthImportJson.js";
import { getAuthImportPath } from "../paths/getAuthImportPath.js";
import { collectAuthImportCandidates } from "./collectAuthImportCandidates.js";

/**
 * Loads a source auth file and extracts importable provider candidates.
 *
 * @param source Import source identifier.
 * @param modelRegistry Active Nexus model registry.
 * @returns Import path and candidates.
 */
export async function loadAuthImportCandidates(
	source: AuthImportSource,
	modelRegistry: LoginImportModelRegistry,
): Promise<{ readonly authPath: string; readonly candidates: AuthImportCandidate[] }> {
	const authPath = getAuthImportPath(source);
	const data = await readAuthImportJson(authPath);
	return { authPath, candidates: collectAuthImportCandidates(source, data, modelRegistry) };
}
