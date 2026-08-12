import { isResumeLaunch } from "@nexus/runtime";
import { parseResumeCliRequest } from "@nexus/runtime";

/**
 * Returns whether the current process was launched into the Nexus resume picker.
 *
 * @param argv Process argument vector.
 * @returns True when startup is entering resume selection.
 */
export function hasResumeCliFlag(argv: readonly string[]): boolean {
	return isResumeLaunch() || parseResumeCliRequest(argv).mode !== "none";
}
