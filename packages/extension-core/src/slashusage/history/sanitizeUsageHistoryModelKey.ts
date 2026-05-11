/**
 * Encodes a usage model key into an injective filesystem-safe JSONL basename.
 *
 * @param modelKey Provider-scoped model key.
 * @returns Filesystem-safe encoded model key.
 */
export function sanitizeUsageHistoryModelKey(modelKey: string): string {
	return Buffer.from(modelKey, "utf8").toString("base64url");
}
