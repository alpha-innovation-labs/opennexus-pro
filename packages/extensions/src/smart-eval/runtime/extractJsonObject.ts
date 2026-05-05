/**
 * Extracts the first JSON object from model output.
 *
 * @param output Raw model output.
 * @returns JSON object string when present.
 */
export function extractJsonObject(output: string): string | undefined {
	const start = output.indexOf("{");
	const end = output.lastIndexOf("}");
	if (start === -1 || end === -1 || end <= start) return undefined;
	return output.slice(start, end + 1);
}
