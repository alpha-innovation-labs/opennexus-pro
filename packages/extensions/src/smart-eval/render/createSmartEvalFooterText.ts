import { isSmartEvalPending } from "../score/isSmartEvalPending.js";
import { getSmartEvalResult, isSmartEvalExpanded } from "../state/smartEvalState.js";
import { formatSmartEvalDetails } from "./formatSmartEvalDetails.js";
import { formatSmartEvalSuffix } from "./formatSmartEvalSuffix.js";

/**
 * Appends smart-eval score and optional details to an assistant footer.
 *
 * @param baseText Existing assistant footer text.
 * @param assistantTimestamp Assistant message timestamp.
 * @param theme UI theme color adapter.
 * @returns Footer text with smart-eval content when available.
 */
export function createSmartEvalFooterText(
	baseText: string,
	assistantTimestamp: number | undefined,
	theme: { fg: (name: "success" | "error" | "muted", text: string) => string },
): string {
	if (typeof assistantTimestamp !== "number") return baseText;
	const result = getSmartEvalResult(assistantTimestamp);
	if (!result) return baseText;
	const suffix = formatSmartEvalSuffix(result, theme);
	const details = !isSmartEvalPending(result) && isSmartEvalExpanded() ? `\n${formatSmartEvalDetails(result, theme)}` : "";
	return `${baseText}${suffix}${details}`;
}
