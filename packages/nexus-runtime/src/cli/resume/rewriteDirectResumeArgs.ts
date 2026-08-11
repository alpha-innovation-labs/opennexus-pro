import type { ResumeCliRequest } from "./parseResumeCliRequest";

/**
 * Rewrites a direct resume request into Pi's native --session syntax.
 *
 * @param argv Raw CLI arguments.
 * @param request Parsed direct-resume request.
 * @returns Normalized arguments that open the requested session directly.
 */
export function rewriteDirectResumeArgs(
	argv: readonly string[],
	request: ResumeCliRequest,
): string[] {
	if (
		request.mode !== "direct" ||
		request.flagIndex === undefined ||
		!request.target
	) {
		return [...argv];
	}

	const afterStart = request.flagIndex + (request.consumesNextArg ? 2 : 1);
	return [
		...argv.slice(0, request.flagIndex),
		"--session",
		request.target,
		...argv.slice(afterStart),
	];
}
