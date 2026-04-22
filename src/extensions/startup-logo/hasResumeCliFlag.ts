import { parseResumeCliRequest } from "../../runtime/cli/resume/parseResumeCliRequest.js";

/**
 * Returns whether the current process was launched into the Nexus resume picker.
 *
 * @param argv Process argument vector.
 * @returns True when startup is entering resume selection.
 */
export function hasResumeCliFlag(argv: readonly string[]): boolean {
	return parseResumeCliRequest(argv).mode === "picker";
}
