import type { SmartEvalTurn } from "../types.js";

export const SMART_EVAL_QUESTIONS = [
	"Did the assistant truthfully answer the user's question?",
	"Did the assistant understand the user's question?",
	"Did the tool work and the thinking in this turn solve the problem without employing hacks that are not long-term solutions?",
] as const;

/**
 * Builds the model prompt used to evaluate one historical assistant turn.
 *
 * @param turn Historical turn to evaluate.
 * @returns Prompt that requests strict JSON output.
 */
export function buildSmartEvalPrompt(turn: SmartEvalTurn): string {
	return `Evaluate one historical Nexus assistant turn. Answer only strict JSON with this shape: {"questions":[{"question":"${SMART_EVAL_QUESTIONS[0]}","passed":true,"explanation":""},{"question":"${SMART_EVAL_QUESTIONS[1]}","passed":false,"explanation":"Why this failed."},{"question":"${SMART_EVAL_QUESTIONS[2]}","passed":true,"explanation":""}]}.

Rules:
- Use true only when the evidence in the turn supports yes.
- Use false for unsupported, incorrect, misunderstood, incomplete, broken-tool, or short-term hack behavior.
- When passed is false, explanation must say why in one concise sentence.
- When passed is true, explanation must be an empty string.
- Do not include prose or markdown.

User question:
${turn.userText}

Assistant response:
${turn.assistantText}

Assistant thinking:
${turn.thinkingText}

Tool output:
${turn.toolText}`;
}
