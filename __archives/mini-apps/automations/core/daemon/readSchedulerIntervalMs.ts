import { AUTOMATIONS_SCHEDULER_INTERVAL_MS } from "../shared/constants.js";

/**
 * Reads the scheduler boundary interval from the environment for deterministic tests.
 *
 * @returns Scheduler boundary interval in milliseconds.
 */
export function readSchedulerIntervalMs(): number {
	const configured = process.env.NEXUS_AUTOMATIONS_TICK_MS;
	return configured ? Number(configured) : AUTOMATIONS_SCHEDULER_INTERVAL_MS;
}
