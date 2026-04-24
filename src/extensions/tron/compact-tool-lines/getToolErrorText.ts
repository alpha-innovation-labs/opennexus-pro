import { firstLine } from "./firstLine.ts";
import { getResultText } from "./getResultText.ts";

/**
 * Extracts the inline error text shown for a failed tool call.
 *
 * @param result Tool result payload.
 * @returns First non-empty error line.
 */
export function getToolErrorText(result: any): string {
	const resultText = firstLine(getResultText(result));
	if (resultText) return resultText;
	const details = result?.details;
	if (typeof details === "string") return firstLine(details) || "Tool call failed";
	if (details && Object.keys(details).length > 0) return firstLine(JSON.stringify(details)) || "Tool call failed";
	return "Tool call failed";
}
