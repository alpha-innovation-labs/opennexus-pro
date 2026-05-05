import { getSmartEvalScore } from "../score/getSmartEvalScore.js";
import type { SmartEvalState } from "../types.js";

/**
 * Renders smart-eval state to an observation-style markdown report.
 *
 * @param state Smart-eval state.
 * @returns Markdown report.
 */
export function renderSmartEvalMarkdown(state: SmartEvalState): string {
	const lines = [
		`# Smart evals: ${state.conversationId}`,
		"",
		`- CWD: ${state.cwd}`,
		`- Session: ${state.sessionFile ?? "ephemeral"}`,
		`- Updated: ${new Date(state.updatedAt).toISOString()}`,
		`- Summary: ${state.summary}`,
		"",
	];
	for (const turn of state.turns) {
		lines.push(`## Turn ${turn.index} · ${getSmartEvalScore(turn.result)}`, "", `- Assistant timestamp: ${turn.assistantTimestamp}`, `- Evaluated: ${new Date(turn.evaluatedAt).toISOString()}`, "", "### Questions");
		for (const question of turn.result.questions) {
			lines.push(`- ${question.passed ? "yes" : "no"}: ${question.question}`);
			if (!question.passed && question.explanation) lines.push(`  - why: ${question.explanation}`);
		}
		lines.push("", "### User", "", turn.userText.trim() || "(empty)", "", "### Assistant", "", turn.assistantText.trim() || "(empty)", "");
	}
	return `${lines.join("\n").trim()}\n`;
}
