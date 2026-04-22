/**
 * Returns whether the current process was launched with the resume selector flag.
 *
 * @param argv Process argument vector.
 * @returns True when startup is entering resume selection.
 */
export function hasResumeCliFlag(argv: readonly string[]): boolean {
	return argv.includes("--resume");
}
