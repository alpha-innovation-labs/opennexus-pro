import type { ResumeScope } from "./ResumeScope";

/**
 * Returns the next resume source for keyboard toggles.
 *
 * @param scope Current resume source.
 * @returns Next resume source.
 */
export function getNextResumeScope(scope: ResumeScope): ResumeScope {
	return scope === "all" ? "current" : "all";
}
