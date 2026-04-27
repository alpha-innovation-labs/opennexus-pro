import { STARTUP_PROFILE_ENV } from "./constants.js";

/**
 * Reports whether startup profiling is enabled for the current run.
 *
 * @returns True when startup profiling is enabled.
 */
export function isStartupProfileEnabled(): boolean {
	const value = process.env[STARTUP_PROFILE_ENV]?.trim().toLowerCase();
	return value === "1" || value === "true" || value === "yes" || value === "on";
}
