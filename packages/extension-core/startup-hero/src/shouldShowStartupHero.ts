import { hasResumeCliFlag } from "./hasResumeCliFlag";

/**
 * Returns whether the startup hero should be shown for the session start reason.
 *
 * @param reason Session start reason.
 * @param argv Process argument vector.
 * @returns True when the startup hero should be rendered.
 */
export function shouldShowStartupHero(
	reason: string,
	argv: readonly string[],
): boolean {
	if (reason === "startup") return !hasResumeCliFlag(argv);
	return reason === "new" || reason === "fork";
}
