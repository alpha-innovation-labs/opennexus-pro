/**
 * Extracts the persisted session id from a Pi/Nexus session filename.
 *
 * @param fileName Session filename in the `<timestamp>_<session-id>.jsonl` format.
 * @returns Session id when the filename carries one.
 */
export function getSessionIdFromSessionFileName(
	fileName: string,
): string | undefined {
	if (!fileName.endsWith(".jsonl")) return undefined;

	const baseName = fileName.slice(0, -".jsonl".length);
	const separatorIndex = baseName.lastIndexOf("_");
	if (separatorIndex < 0) return undefined;

	const sessionId = baseName.slice(separatorIndex + 1);
	return sessionId.length > 0 ? sessionId : undefined;
}
