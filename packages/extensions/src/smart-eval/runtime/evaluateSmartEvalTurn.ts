import { buildSmartEvalPrompt } from "../prompt/buildSmartEvalPrompt.js";
import type { SmartEvalResult, SmartEvalTurn } from "../types.js";
import { createSmartEvalArgs } from "./createSmartEvalArgs.js";
import { parseSmartEvalOutput } from "./parseSmartEvalOutput.js";
import { runSmartEvalSubprocess } from "./runSmartEvalSubprocess.js";

/**
 * Evaluates one historical turn through the active Nexus model.
 *
 * @param turn Turn to evaluate.
 * @param ctx Runtime context subset.
 * @returns Smart-eval result when the subprocess succeeds and returns valid JSON.
 */
export async function evaluateSmartEvalTurn(
	turn: SmartEvalTurn,
	ctx: { cwd: string; model?: { provider?: string; id?: string } },
): Promise<SmartEvalResult | undefined> {
	const args = createSmartEvalArgs(buildSmartEvalPrompt(turn), ctx.model);
	const result = await runSmartEvalSubprocess(args, ctx.cwd);
	if (result.code !== 0 || result.stderr.trim()) return undefined;
	return parseSmartEvalOutput(result.stdout, turn.assistantTimestamp, turn.turnId);
}
