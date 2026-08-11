import { formatStartupDurationBadge } from "./formatStartupDurationBadge";
import { startupStartedAtEnvVar } from "./startupStartedAtEnvVar";

/**
 * Reads the current startup duration from process state and formats it for the hero.
 *
 * @returns Startup timer badge, or undefined when no start marker exists.
 */
export function getStartupDurationBadge(): string | undefined {
	const startedAt = Number(process.env[startupStartedAtEnvVar]);
	if (!Number.isFinite(startedAt)) return undefined;
	return formatStartupDurationBadge(performance.now() - startedAt);
}
