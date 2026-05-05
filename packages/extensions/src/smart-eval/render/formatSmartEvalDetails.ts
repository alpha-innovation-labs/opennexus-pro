import type { SmartEvalResult } from "../types.js";

/**
 * Formats expanded smart-eval question lines.
 *
 * @param result Smart-eval result.
 * @param theme UI theme color adapter.
 * @returns Newline-prefixed detail lines.
 */
export function formatSmartEvalDetails(
	result: SmartEvalResult,
	theme: { fg: (name: "success" | "error" | "muted", text: string) => string },
): string {
	return result.questions
		.map((question) => {
			const answer = question.passed ? theme.fg("success", "yes") : theme.fg("error", "no");
			const explanation = !question.passed && question.explanation ? `\n${theme.fg("muted", `    why: ${question.explanation}`)}` : "";
			return theme.fg("muted", `  ${question.question}: `) + answer + explanation;
		})
		.join("\n");
}
