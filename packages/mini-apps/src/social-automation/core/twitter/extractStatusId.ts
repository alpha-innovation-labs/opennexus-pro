/**
 * Extracts a canonical numeric status id from Nitter RSS fields.
 *
 * @param guid RSS guid value.
 * @param link RSS link value.
 * @returns Canonical status id or guid fallback.
 */
export function extractStatusId(guid: string, link: string): string {
	const linkMatch = link.match(/status\/(\d+)/u);
	if (linkMatch?.[1]) return linkMatch[1];
	const guidMatch = guid.match(/(\d{10,})/u);
	return guidMatch?.[1] ?? guid;
}
