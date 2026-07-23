import { fromFileUri } from "../workspace/fromFileUri.js";

/**
 * Formats LSP locations into compact text for the agent.
 *
 * @param result Raw LSP result.
 * @returns Human-readable locations.
 */
export function formatLocations(result: unknown): string {
	const items = Array.isArray(result) ? result : result ? [result] : [];
	if (items.length === 0) return "No locations found.";
	return items.slice(0, 50).map((item) => {
		const location = item as { uri?: string; targetUri?: string; range?: { start?: { line?: number; character?: number } }; targetRange?: { start?: { line?: number; character?: number } } };
		const uri = location.uri ?? location.targetUri ?? "unknown";
		const start = location.range?.start ?? location.targetRange?.start ?? {};
		return `${fromFileUri(uri)}:${(start.line ?? 0) + 1}:${(start.character ?? 0) + 1}`;
	}).join("\n");
}
