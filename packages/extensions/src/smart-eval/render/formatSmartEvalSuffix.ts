import type { SmartEvalResult } from "../types.js";
import { didSmartEvalPass } from "../score/didSmartEvalPass.js";
import { getSmartEvalScore } from "../score/getSmartEvalScore.js";
import { isSmartEvalPending } from "../score/isSmartEvalPending.js";

const PENDING_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

/**
 * Formats the compact colored smart-eval footer suffix.
 *
 * @param result Smart-eval result.
 * @param theme UI theme color adapter.
 * @returns Footer suffix with score and pass/fail symbol.
 */
export function formatSmartEvalSuffix(
	result: SmartEvalResult,
	theme: { fg: (name: "success" | "error" | "muted", text: string) => string },
): string {
	if (isSmartEvalPending(result)) {
		const frame = PENDING_FRAMES[Math.floor(Date.now() / 100) % PENDING_FRAMES.length] ?? "⠋";
		return theme.fg("muted", ` · ${frame} evaluating eval`);
	}
	const passed = didSmartEvalPass(result);
	return ` · ${getSmartEvalScore(result)} ${theme.fg(passed ? "success" : "error", passed ? "✓" : "✕")}`;
}
