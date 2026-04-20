import { logStartupProfileEvent } from "../../extensions/primitives/observability/startup-profile/logStartupProfileEvent.js";

/**
 * Logs one timed runApp startup phase.
 *
 * @param phase Phase name.
 * @param startedAt Phase start timestamp from performance.now().
 */
export function logRunAppPhase(phase: string, startedAt: number): void {
	logStartupProfileEvent("runApp", phase, {
		durationMs: Number((performance.now() - startedAt).toFixed(3)),
	});
}
