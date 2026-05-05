import { SMART_EVAL_QUESTIONS } from "../prompt/buildSmartEvalPrompt.js";
import type { SmartEvalResult } from "../types.js";
import { extractJsonObject } from "./extractJsonObject.js";

/**
 * Parses strict smart-eval JSON output into a normalized result.
 *
 * @param output Raw model output.
 * @param assistantTimestamp Assistant message timestamp.
 * @returns Parsed result, or undefined when malformed.
 */
export function parseSmartEvalOutput(output: string, assistantTimestamp: number, turnId?: string): SmartEvalResult | undefined {
	const json = extractJsonObject(output);
	if (!json) return undefined;
	try {
		const parsed = JSON.parse(json) as { questions?: Array<{ question?: unknown; passed?: unknown; explanation?: unknown }> };
		if (!Array.isArray(parsed.questions)) return undefined;
		const questions = SMART_EVAL_QUESTIONS.map((question, index) => {
			const passed = parsed.questions?.[index]?.passed === true;
			const explanation = typeof parsed.questions?.[index]?.explanation === "string" ? parsed.questions[index].explanation.trim() : "";
			return { question, passed, explanation: passed ? "" : explanation };
		});
		return { assistantTimestamp, turnId, status: "complete", questions };
	} catch {
		return undefined;
	}
}
