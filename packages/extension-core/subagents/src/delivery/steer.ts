import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { extractFinalAssistantMessage } from "../completion";
import type { RunCompletion, RunEntry } from "../running";
import {
	type ResultDeliveryOptions,
	type RunResult,
	SUBAGENT_PING_CUSTOM_TYPE,
	SUBAGENT_RESULT_CUSTOM_TYPE,
	type SubagentPing,
	type SubagentPingMessage,
	type SubagentResultMessage,
} from "./types";

/**
 * The minimal pi surface the delivery layer needs: the parent sends itself
 * custom messages. Typed as a `Pick` of the real `ExtensionAPI` so a full
 * `ExtensionAPI` is directly assignable and a test stub only implements this.
 */
export type SteerSender = Pick<ExtensionAPI, "sendMessage">;

/**
 * Assemble the delivered result of a finished run.
 *
 * Combines the classified completion (status, finished time, exit code,
 * detail) with the run's identity (id, name, session file) and the summary —
 * the run's final assistant message, extracted from its session tail. The
 * summary is read at assembly time, when the run has already reached its
 * terminal state, so the tail carries the final message.
 */
export function assembleRunResult(
	run: RunEntry,
	completion: RunCompletion,
): RunResult {
	const summary = extractFinalAssistantMessage(
		run.sessionPath,
		run.entryCountAtLaunch,
	);
	return {
		...completion,
		runId: run.id,
		name: run.name,
		summary: summary?.hasRealText ? summary.text : null,
		sessionPath: run.sessionPath,
	};
}

/**
 * Render the LLM-facing content of a result steer message.
 *
 * The headline names the run and its terminal status; the body carries the
 * summary and, when there is one, the error or stop detail. The parent's
 * model sees exactly this text.
 */
export function renderResultContent(result: RunResult): string {
	const phrase =
		result.status === "completed"
			? "completed"
			: result.status === "failed"
				? "failed"
				: "was cancelled";
	const lines = [
		`Subagent run "${result.name}" (id: ${result.runId}) ${phrase}.`,
	];
	if (result.summary !== null) {
		lines.push("", "Final answer:", result.summary);
	}
	if (result.detail !== undefined && result.detail.trim().length > 0) {
		lines.push("", `Detail: ${result.detail}`);
	}
	return lines.join("\n");
}

/**
 * Build the custom-typed steer message that carries a finished run's result.
 *
 * The message is custom-typed in the parent's own transcript: `content` is
 * what the parent's model sees, and `details` records the result
 * structurally, so the parent's session file marks the moment a run's result
 * arrived and a test harness can assert on it.
 */
export function buildResultSteerMessage(
	result: RunResult,
): SubagentResultMessage {
	return {
		customType: SUBAGENT_RESULT_CUSTOM_TYPE,
		content: renderResultContent(result),
		display: true,
		details: result,
	};
}

/**
 * Deliver a finished run's result to the parent as a steer message.
 *
 * The message is flagged to start a new turn (`triggerTurn`): when the parent
 * is idle the harness appends it to the parent session and starts a fresh
 * turn, so the parent wakes with the result already in context; when the
 * parent is still streaming the harness steers it into the running turn.
 * Either way the parent does not poll, sleep, or read the child's files —
 * delivery is push, not pull.
 */
export function deliverResultSteer(pi: SteerSender, result: RunResult): void {
	pi.sendMessage(buildResultSteerMessage(result), { triggerTurn: true });
}

/**
 * Wait for a run to reach its terminal state and return its delivered result.
 *
 * The sync (blocking) path: the blocking launch tool call awaits this and
 * returns the summary in its own result, so the parent is holding the answer
 * in the same turn it launched the run. No separate steer message is needed,
 * because the parent never left.
 */
export async function awaitRunResult(run: RunEntry): Promise<RunResult> {
	const completion = await run.completion;
	return assembleRunResult(run, completion);
}

/**
 * Attach result delivery to a registered run.
 *
 * When the run's watcher settles — its completion promise resolves — the
 * parent sends itself the result as a steer message, flagged to start a new
 * turn. This is the async path (the default): the run's watcher drives the
 * run to a terminal state, and the parent is woken by the push, not by
 * polling.
 *
 * A run launched blocking gets no steer message: its launch tool call awaits
 * the completion promise and returns the summary inline, and "no separate
 * steer message is needed, because the parent never left."
 *
 * The settle fires at most once (a run has one terminal state and the
 * registry's completion promise settles once), so delivery happens at most
 * once per run. A run that settled before the attachment is still delivered:
 * awaiting an already-settled promise resolves on the next microtask.
 *
 * @returns A detach function that stops delivery before the settle fires.
 *   Detaching after the settle is a no-op.
 */
export function attachResultDelivery(
	pi: SteerSender,
	run: RunEntry,
	options: ResultDeliveryOptions = {},
): () => void {
	if (options.blocking) {
		// Sync path: the launch tool call awaits the run and returns the
		// summary inline. Nothing is pushed.
		return () => {};
	}
	let detached = false;
	void run.completion.then((completion) => {
		if (detached) return;
		deliverResultSteer(pi, assembleRunResult(run, completion));
	});
	return () => {
		detached = true;
	};
}

/**
 * Render the LLM-facing content of a mid-run ping message.
 */
export function renderPingContent(ping: SubagentPing): string {
	return [
		`Subagent run "${ping.name}" (id: ${ping.runId}) sent a mid-run ping:`,
		ping.note,
	].join("\n");
}

/**
 * Build the custom-typed steer message for a mid-run ping.
 *
 * The ping is a separate channel from the completion result: its custom type
 * is distinct and its typed payload carries a note, never a terminal status.
 * Building and sending a ping settles nothing — the run keeps running.
 */
export function buildPingSteerMessage(ping: SubagentPing): SubagentPingMessage {
	return {
		customType: SUBAGENT_PING_CUSTOM_TYPE,
		content: renderPingContent(ping),
		display: true,
		details: ping,
	};
}

/**
 * Deliver a mid-run ping to the parent as a steer message.
 *
 * Separate from completion delivery: the message is flagged to start a new
 * turn the same way a result is (so an idle parent wakes to read the note),
 * but it carries no terminal status and does not end the run. Conflating a
 * mid-run ping with a completion is the failure the two separate channels
 * exist to avoid.
 */
export function deliverPingSteer(pi: SteerSender, ping: SubagentPing): void {
	pi.sendMessage(buildPingSteerMessage(ping), { triggerTurn: true });
}
