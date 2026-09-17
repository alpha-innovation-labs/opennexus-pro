/**
 * Steer-delivery layer: deliver finished-run results back to the parent.
 *
 * A finished run reaches the parent by one of two paths, chosen by whether the
 * run is async. Both paths carry the same result; they differ in who waits:
 *
 * - **Async** (the default). When a detached run's watcher settles, the parent
 *   sends itself a steer message carrying the result, flagged to start a new
 *   turn. The harness injects the message into the parent session as a fresh
 *   turn, so the parent wakes with the result already in context. The parent
 *   does not poll, sleep, or read the child's files; delivery is push, not
 *   pull. The steer message is a custom-typed message in the parent's own
 *   transcript, so the parent's session file records the moment a run's
 *   result arrived — which a test harness can assert on.
 * - **Sync.** A run marked blocking returns inline: the launch tool call
 *   awaits the run's completion promise and returns the summary in its own
 *   result. No separate steer message is needed, because the parent never
 *   left.
 *
 * A child can also send a mid-run ping before it finishes. The ping is a
 * separate channel from the completion result: it does not end the run and it
 * does not carry a terminal status. Conflating a mid-run ping with a
 * completion is the failure the two separate channels exist to avoid.
 *
 * Target: context/extension/subagents/steer-delivery.md.
 */

import type { RunCompletion } from "../running";

/**
 * The `customType` of the steer message that carries a finished run's result.
 *
 * The message is a custom message entry in the parent's own transcript:
 * inspectable in the parent's session file, which a test harness reads as its
 * oracle.
 */
export const SUBAGENT_RESULT_CUSTOM_TYPE = "subagent.result" as const;

/**
 * The `customType` of a mid-run ping from a child to its parent.
 *
 * Distinct from {@link SUBAGENT_RESULT_CUSTOM_TYPE}: the ping channel carries
 * notes without terminal status, and the completion channel carries the
 * terminal result. The two custom types keep the channels separate in the
 * transcript.
 */
export const SUBAGENT_PING_CUSTOM_TYPE = "subagent.ping" as const;

/**
 * The delivered result of a finished run.
 *
 * The classified terminal outcome (the value the registry's completion
 * promise settles with) plus the run's identity (id, name, session file) and
 * the summary — the run's final assistant message, extracted from the session
 * tail. Both delivery paths carry this same result; they differ in who waits.
 */
export interface RunResult extends RunCompletion {
	/** The stable run id. */
	readonly runId: string;
	/** The display name. */
	readonly name: string;
	/**
	 * The run's summary: the text of its final assistant message, or `null`
	 * when the run produced no real final message.
	 */
	readonly summary: string | null;
	/** Absolute path to the run's session file (the durable record). */
	readonly sessionPath: string;
}

/**
 * A mid-run ping from a child to its parent.
 *
 * Deliberately carries no terminal status: a ping does not end the run and
 * does not settle the completion channel. It is a note the parent can learn
 * before the run completes.
 */
export interface SubagentPing {
	/** The stable run id of the sending child. */
	readonly runId: string;
	/** The display name of the sending child. */
	readonly name: string;
	/** The note the child is delivering. */
	readonly note: string;
	/** ISO timestamp of when the ping was sent. */
	readonly sentAt: string;
}

/**
 * The steer message the delivery layer sends to the parent session.
 *
 * Structurally the message shape pi's `sendMessage` accepts (a `CustomMessage`
 * without its `role` and `timestamp`, which the harness supplies). `content`
 * is what the parent's model sees; `details` is the typed, inspectable payload
 * the parent's session file records.
 */
export interface SubagentSteerMessage<TDetails = unknown> {
	/** The channel identifier: `subagent.result` or `subagent.ping`. */
	readonly customType: string;
	/** The LLM-facing text of the message. */
	readonly content: string;
	/** Whether the message is rendered in the interactive transcript. */
	readonly display: true;
	/** The typed payload recorded in the parent's session file. */
	readonly details: TDetails;
}

/** The steer message that carries a finished run's result. */
export interface SubagentResultMessage extends SubagentSteerMessage<RunResult> {
	readonly customType: typeof SUBAGENT_RESULT_CUSTOM_TYPE;
}

/** The steer message that carries a mid-run ping. */
export interface SubagentPingMessage
	extends SubagentSteerMessage<SubagentPing> {
	readonly customType: typeof SUBAGENT_PING_CUSTOM_TYPE;
}

/**
 * Options for attaching result delivery to a run.
 */
export interface ResultDeliveryOptions {
	/**
	 * True when the run was launched blocking (sync). The launch tool call
	 * awaits the run's completion promise and returns the summary inline, so
	 * no steer message is sent — the parent never left. Defaults to false
	 * (async): the run's result is pushed as a steer message when its watcher
	 * settles.
	 */
	readonly blocking?: boolean;
}
