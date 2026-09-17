import type {
	SignalProcessGroupResult,
	StopProcessGroupOptions,
	StopProcessGroupResult,
} from "./types";

/**
 * Process-group signalling: the low-level primitive stop is built on.
 *
 * A run's child was spawned detached, so it is its own process-group leader
 * (POSIX `setsid`) and its pid is the process-group id. A signal to the
 * negative pid reaches the whole group — the child and anything it spawned —
 * so they end together. Stop sends a terminate signal and, if the group does
 * not die, follows with a kill signal after a grace period.
 *
 * Target: context/extension/subagents/stop-resume.md (stop).
 */

/** The default initial terminate signal stop sends to the process group. */
export const DEFAULT_STOP_SIGNAL: NodeJS.Signals = "SIGTERM";

/** The default escalation signal sent when the group survives the grace period. */
export const DEFAULT_STOP_ESCALATE_SIGNAL: NodeJS.Signals = "SIGKILL";

/** The default grace period the group is given to die after the terminate signal. */
export const DEFAULT_STOP_GRACE_MS = 3000;

/** The default interval between liveness probes while waiting out the grace period. */
export const DEFAULT_STOP_POLL_MS = 50;

/**
 * Whether an error thrown by `process.kill` means the (process) group no
 * longer exists.
 */
function isNoSuchProcess(error: unknown): boolean {
	return (
		typeof error === "object" &&
		error !== null &&
		(error as { code?: unknown }).code === "ESRCH"
	);
}

/**
 * Signal a run's whole process group using the negative pid, so the child and
 * anything it spawned end together.
 *
 * A negative pid targets the process group whose id equals the absolute value
 * of the pid. For a detached spawn the child is its own group leader, so the
 * group id is the child's pid and the signal reaches the whole subtree.
 *
 * The group already being gone (ESRCH) is not an error: the goal — the group
 * being gone — already holds. Any other error (for example EPERM, a group
 * that is not ours to signal) is re-thrown.
 *
 * @param processGroupId The process-group id (the child's pid for a detached spawn).
 * @param signal The signal to send.
 * @returns Whether the group was already gone and the signal was a no-op.
 */
export function signalProcessGroup(
	processGroupId: number,
	signal: NodeJS.Signals,
): SignalProcessGroupResult {
	try {
		process.kill(-processGroupId, signal);
		return { signal, alreadyGone: false };
	} catch (error) {
		if (isNoSuchProcess(error)) {
			return { signal, alreadyGone: true };
		}
		throw error;
	}
}

/**
 * Whether a process group is still alive.
 *
 * Probes the group with signal 0, which delivers nothing: it only reports
 * whether the group exists. ESRCH means the group is gone. EPERM means the
 * group exists but is not ours to signal — it is still alive, so it reports
 * alive. A child that exited but left descendants in the group keeps the
 * group alive, which is exactly the case the escalation exists for.
 *
 * @param processGroupId The process-group id to probe.
 * @returns True when the group is still alive.
 */
export function isProcessGroupAlive(processGroupId: number): boolean {
	try {
		process.kill(-processGroupId, 0);
		return true;
	} catch (error) {
		return !isNoSuchProcess(error);
	}
}

/**
 * Stop a process group: send a terminate signal, wait out a grace period,
 * and escalate to a kill signal if the group does not die.
 *
 * The terminate signal (default SIGTERM) gives the group a chance to shut
 * down cleanly. While the grace period runs, the group is probed with signal
 * 0. If it survives the grace period, the kill signal (default SIGKILL) is
 * sent; SIGKILL is uncatchable, so a group that ignored the terminate cannot
 * ignore it. The escalation goes out only when the group is still alive, so
 * a clean exit within the grace period is never escalated. After the
 * escalation, the group is probed for a short confirmation window before the
 * result is reported, so a surviving group is a genuine anomaly (a process
 * stuck in the kernel), not a race with the reaping.
 *
 * @param processGroupId The process-group id to stop (the child's pid for a
 *   detached spawn).
 * @param options The signals, grace period, and probe interval.
 * @returns The outcome: the initial signal, whether the group was already
 *   gone, whether the escalation was sent, and whether the group was still
 *   observable after the escalation and its confirmation probe.
 */
export async function stopProcessGroup(
	processGroupId: number,
	options: StopProcessGroupOptions = {},
): Promise<StopProcessGroupResult> {
	const signal = options.signal ?? DEFAULT_STOP_SIGNAL;
	const escalateSignal = options.escalateSignal ?? DEFAULT_STOP_ESCALATE_SIGNAL;
	const graceMs = options.graceMs ?? DEFAULT_STOP_GRACE_MS;
	const pollMs = options.pollMs ?? DEFAULT_STOP_POLL_MS;

	const initial = signalProcessGroup(processGroupId, signal);

	// Wait out the grace period, probing for the group's death. The loop exits
	// as soon as the group is gone or the deadline is reached.
	const deadline = Date.now() + graceMs;
	for (;;) {
		if (!isProcessGroupAlive(processGroupId)) break;
		if (Date.now() >= deadline) break;
		const waitMs = Math.min(pollMs, deadline - Date.now());
		if (waitMs <= 0) break;
		// The timer stays ref'd: a stop is a foreground operation and must run
		// to completion, including the escalation, even if nothing else keeps
		// the event loop alive.
		await new Promise<void>((resolve) => {
			setTimeout(resolve, waitMs);
		});
	}

	// Escalate only when the group survived the grace period.
	const survived = isProcessGroupAlive(processGroupId);
	let escalated = false;
	let stillAlive = false;
	if (survived) {
		escalated = true;
		signalProcessGroup(processGroupId, escalateSignal);
		// SIGKILL is uncatchable, so the group is going to die; the kernel's
		// reaping can lag the signal, though. Probe for a short confirmation
		// window so `stillAlive` reports a genuine anomaly (a group still
		// alive after SIGKILL) rather than a reaping race.
		const confirmDeadline = Date.now() + graceMs;
		for (;;) {
			if (!isProcessGroupAlive(processGroupId)) break;
			if (Date.now() >= confirmDeadline) break;
			const waitMs = Math.min(pollMs, confirmDeadline - Date.now());
			if (waitMs <= 0) break;
			await new Promise<void>((resolve) => {
				setTimeout(resolve, waitMs);
			});
		}
		stillAlive = isProcessGroupAlive(processGroupId);
	}

	return {
		signal,
		alreadyGone: initial.alreadyGone,
		escalated,
		stillAlive,
	};
}
