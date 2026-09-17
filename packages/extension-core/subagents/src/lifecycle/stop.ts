import type { RunEntry } from "../running";
import { stopProcessGroup } from "./group-signal";
import type { StopSubagentRunOptions, StopSubagentRunResult } from "./types";

/**
 * Stop a run: abort the watcher loop, signal the detached process group with
 * a kill fallback, and — for an interactive run — close the terminal surface.
 *
 * Stop acts on the process group; it never reasons about the run's state in
 * the session file — that is resume's layer. Stopping a run:
 *
 * 1. **Aborts the watcher loop** by aborting the run's abort controller, the
 *    signal every watcher loop subscribes to. An already-completed run's
 *    controller is already aborted, so a stop on a finished run is a no-op
 *    there.
 * 2. **Signals the child's whole process group** using the negative pid, so
 *    the child and its descendants end together. A terminate signal goes
 *    first; if the group does not die, a kill signal follows after a grace
 *    period.
 * 3. **Closes the terminal surface** of an interactive run, after the group
 *    has been stopped.
 *
 * Stop requires the run to have been spawned detached: only a detached child
 * is a process-group leader, and only a group leader can be signalled as a
 * group. A run that was not detached cannot be stopped cleanly — the group
 * signal cannot target it as a group, and its children survive the stop.
 *
 * When a completion watcher handle is given, its `stop(reason)` is called so
 * the run is classified as a stop on request (cancelled, or completed when it
 * had already produced a real answer) rather than as a plain signalled exit.
 *
 * Target: context/extension/subagents/stop-resume.md (stop).
 *
 * @param entry The registered run (a live entry with the process group and
 *   the abort controller that stops the watcher loop).
 * @param options The stop reason, the watcher handle, the interactive run's
 *   terminal surface, and the process-group stop options.
 * @returns The outcome of the stop.
 */
export async function stopSubagentRun(
	entry: RunEntry,
	options: StopSubagentRunOptions = {},
): Promise<StopSubagentRunResult> {
	// 1. Abort the watcher loop. Aborting is idempotent; record whether this
	//    stop is what aborted the controller (false when the run had already
	//    completed and the controller was already aborted).
	const watcherAborted = !entry.signal.aborted;
	entry.abortController.abort(
		new Error(`Run ${entry.id} was stopped on request.`),
	);

	// 2. Record the stop intent with the completion watcher, when one is
	//    given, so the classified completion is a stop on request rather than
	//    a plain signalled exit. The watcher's own stop sends the initial
	//    terminate signal; the group stop below is the authoritative sequence
	//    (a repeated SIGTERM on a dying group is a no-op).
	options.watcher?.stop(options.reason);

	// 3. Signal the detached process group with the kill fallback.
	const group = await stopProcessGroup(entry.processGroupId, options.group);

	// 4. An interactive run also closes its terminal surface, after the group
	//    has been stopped.
	let terminalSurfaceClosed = false;
	if (options.terminalSurface !== undefined) {
		options.terminalSurface.close();
		terminalSurfaceClosed = true;
	}

	return {
		runId: entry.id,
		watcherAborted,
		group,
		terminalSurfaceClosed,
	};
}
