/**
 * Builds a normalized FFF finder error.
 *
 * @param operation FFF operation name.
 * @param cause Failure cause.
 * @returns Normalized error.
 */
export function createFinderError(operation: string, cause: unknown): Error {
	const reason = cause instanceof Error ? cause.message : String(cause);
	return new Error(`FFF ${operation} failed: ${reason}`);
}
