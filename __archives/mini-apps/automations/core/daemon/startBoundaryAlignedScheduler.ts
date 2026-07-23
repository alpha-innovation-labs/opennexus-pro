import { getSchedulerBoundaryDelayMs } from "./getSchedulerBoundaryDelayMs.js";

/** Handle for a running boundary-aligned scheduler. */
export type BoundaryAlignedScheduler = {
	/** Stops the next scheduled scheduler tick. */
	stop: () => void;
};

/**
 * Starts a scheduler that runs immediately, then on wall-clock boundaries.
 *
 * @param onTick Scheduler callback to run.
 * @param intervalMs Boundary interval in milliseconds.
 * @returns Handle that stops the scheduler.
 */
export function startBoundaryAlignedScheduler(onTick: () => void, intervalMs: number): BoundaryAlignedScheduler {
	let timer: NodeJS.Timeout | undefined;
	let stopped = false;

	/** Schedules the next callback on the next wall-clock boundary. */
	const scheduleNextTick = (): void => {
		timer = setTimeout(runTickAndScheduleNext, getSchedulerBoundaryDelayMs(new Date(), intervalMs));
	};

	/** Runs one callback and schedules the following boundary tick. */
	const runTickAndScheduleNext = (): void => {
		if (stopped) return;
		onTick();
		scheduleNextTick();
	};

	onTick();
	scheduleNextTick();

	return {
		stop: () => {
			stopped = true;
			if (timer) clearTimeout(timer);
		},
	};
}
