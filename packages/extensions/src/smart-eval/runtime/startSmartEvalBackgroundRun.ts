import type { ExtensionCommandContext, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { clearSmartEvalState } from "../state/clearSmartEvalState.js";
import { createEmptySmartEvalState } from "../storage/createEmptySmartEvalState.js";
import { getMissingSmartEvalTurns } from "../storage/getMissingSmartEvalTurns.js";
import { getSmartEvalPaths } from "../storage/getSmartEvalPaths.js";
import { hydrateSmartEvalState } from "../storage/hydrateSmartEvalState.js";
import { readSmartEvalState } from "../storage/readSmartEvalState.js";
import { writeSmartEvalState } from "../storage/writeSmartEvalState.js";
import { collectHistoricalEvalTurns } from "../turns/collectHistoricalEvalTurns.js";
import { reserveSmartEvalTurns } from "./reserveSmartEvalTurns.js";
import { runMissingSmartEvalsInBackground } from "./runMissingSmartEvalsInBackground.js";

/**
 * Hydrates existing evals and starts missing eval generation in the background.
 *
 * @param ctx Extension context for the current session.
 * @param refresh Whether to discard existing evals and regenerate all historical turns.
 * @returns Number of turns queued for background evaluation.
 */
export async function startSmartEvalBackgroundRun(ctx: ExtensionContext | ExtensionCommandContext, refresh = false): Promise<number> {
	clearSmartEvalState();
	const paths = getSmartEvalPaths(ctx);
	if (!paths.conversationId || !paths.statePath || !paths.markdownPath) return 0;
	const state = refresh
		? createEmptySmartEvalState(paths.conversationId, ctx.cwd, paths.sessionFile)
		: await readSmartEvalState(paths.statePath, paths.conversationId, ctx.cwd, paths.sessionFile);
	hydrateSmartEvalState(state);
	const turns = collectHistoricalEvalTurns(ctx.sessionManager.getBranch());
	const queuedTurns = refresh ? turns : getMissingSmartEvalTurns(turns, state);
	if (refresh || queuedTurns.length === 0) await writeSmartEvalState(paths.statePath, paths.markdownPath, state);
	if (queuedTurns.length === 0) return 0;
	await reserveSmartEvalTurns(queuedTurns, state, { statePath: paths.statePath, markdownPath: paths.markdownPath });
	runMissingSmartEvalsInBackground(
		queuedTurns,
		state,
		{ statePath: paths.statePath, markdownPath: paths.markdownPath },
		ctx,
		refresh ? "Refreshing eval" : "prepping evals",
	);
	return queuedTurns.length;
}
