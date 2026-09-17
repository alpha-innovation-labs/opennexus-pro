/**
 * Steer-delivery layer for the subagents extension.
 *
 * Delivers a finished run's result back to the parent by one of two paths,
 * chosen by whether the run is async. Async (the default): when the run's
 * watcher settles, the parent sends itself a custom-typed steer message
 * carrying the result, flagged to start a new turn, so the parent wakes with
 * the result already in context — push, not pull. Sync: a run marked
 * blocking returns inline; the launch tool call awaits the run's completion
 * promise and returns the summary in its own result. Mid-run pings travel a
 * separate channel: they carry a note, not a terminal status, and do not end
 * the run.
 *
 * See context/extension/subagents/steer-delivery.md.
 */

export {
	assembleRunResult,
	attachResultDelivery,
	awaitRunResult,
	buildPingSteerMessage,
	buildResultSteerMessage,
	deliverPingSteer,
	deliverResultSteer,
	renderPingContent,
	renderResultContent,
	type SteerSender,
} from "./steer";
export {
	type ResultDeliveryOptions,
	type RunResult,
	SUBAGENT_PING_CUSTOM_TYPE,
	SUBAGENT_RESULT_CUSTOM_TYPE,
	type SubagentPing,
	type SubagentPingMessage,
	type SubagentResultMessage,
	type SubagentSteerMessage,
} from "./types";
