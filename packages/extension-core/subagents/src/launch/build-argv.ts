import type { BuildChildArgvInput } from "./types";

/** The one-shot, non-interactive pi flag: process the prompt and exit, no TUI. */
export const HEADLESS_PRINT_FLAG = "--print" as const;

/** The flag that points the child at a specific session file. */
export const SESSION_FLAG = "--session" as const;

/** The flag that loads the mandatory child-side extension. */
export const EXTENSION_FLAG = "--extension" as const;

/**
 * The flag that disables approval for the child. A background child has no operator
 * to answer a prompt, so project-local files are ignored for the run.
 */
export const NO_APPROVE_FLAG = "--no-approve" as const;

/**
 * Build the child's pi-level argv.
 *
 * The argv is the headless prompt form plus a session argument, the mandatory
 * child-side extension, and the profile-derived flags. Approval is disabled for the
 * child, and the task is carried by an artifact-file reference (a `@<path>`) rather
 * than inlined, so a long prompt never hits argument-length limits or
 * shell-quoting edge cases.
 *
 * Order:
 *   --print                 (one-shot headless form)
 *   --session <session>     (point at the child's own session file)
 *   --extension <ext>       (mandatory child-side extension)
 *   --no-approve            (approval disabled: no operator to answer a prompt)
 *   <profile flags>         (compiled profile-derived flags)
 *   @<task artifact path>   (the prompt, passed by artifact-file reference)
 *
 * The trailing `@<path>` is a pi file argument: pi reads the file and uses its
 * contents as the child's initial prompt.
 */
export function buildChildArgv(input: BuildChildArgvInput): string[] {
	const argv: string[] = [
		HEADLESS_PRINT_FLAG,
		SESSION_FLAG,
		input.sessionPath,
		EXTENSION_FLAG,
		input.childExtension,
		NO_APPROVE_FLAG,
		...input.profileFlags,
		`@${input.taskArtifactPath}`,
	];
	return argv;
}
