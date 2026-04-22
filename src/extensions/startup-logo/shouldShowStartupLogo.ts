import { hasResumeCliFlag } from "./hasResumeCliFlag.js";

/**
 * Returns whether the startup logo should be shown for the session start reason.
 *
 * @param reason Session start reason.
 * @param argv Process argument vector.
 * @returns True when the startup logo should be rendered.
 */
export function shouldShowStartupLogo(reason: string, argv: readonly string[]): boolean {
	if (reason === "startup") return !hasResumeCliFlag(argv);
	return reason === "new" || reason === "fork";
}
