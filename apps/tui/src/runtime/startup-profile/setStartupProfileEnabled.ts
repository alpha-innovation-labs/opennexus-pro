import { STARTUP_PROFILE_ENV } from "@nexus/observability";

/**
 * Stores startup-profile enablement in the process environment.
 *
 * @param enabled Whether startup profiling is enabled.
 */
export function setStartupProfileEnabled(enabled: boolean): void {
	if (enabled) process.env[STARTUP_PROFILE_ENV] = "1";
	else delete process.env[STARTUP_PROFILE_ENV];
}
