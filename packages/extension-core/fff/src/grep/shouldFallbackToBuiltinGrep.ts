/**
 * Detects grep requests that should stay on Pi's built-in grep.
 *
 * @param args Relevant grep arguments.
 * @returns True when built-in grep should handle the request.
 */
export function shouldFallbackToBuiltinGrep(args: {
	pattern: string;
	ignoreCase?: boolean;
	literal?: boolean;
}): boolean {
	if (args.ignoreCase === false && args.pattern.toLowerCase() === args.pattern)
		return true;
	if (args.ignoreCase === true && !args.literal) return true;
	return false;
}
