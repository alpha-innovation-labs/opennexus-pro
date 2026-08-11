import { STARTUP_PROFILE_ENV } from "@nexus/observability/startup-profile/constants";

/**
 * Reports whether Tron profiling logs should be emitted.
 *
 * @returns True when Tron profiling is enabled.
 */
export function isTronProfilingEnabled(): boolean {
	const explicit = process.env.NEXUS_TRON_PROFILE?.trim().toLowerCase();
	const startupProfile = process.env[STARTUP_PROFILE_ENV]?.trim().toLowerCase();
	return (
		explicit === "1" ||
		explicit === "true" ||
		explicit === "yes" ||
		explicit === "on" ||
		startupProfile === "1" ||
		startupProfile === "true" ||
		startupProfile === "yes" ||
		startupProfile === "on"
	);
}
