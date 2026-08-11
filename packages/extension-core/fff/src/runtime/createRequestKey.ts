/**
 * Creates a stable cache key for grep continuations.
 *
 * @param request Relevant grep request data.
 * @returns Stable request key.
 */
export function createRequestKey(request: Record<string, unknown>): string {
	return JSON.stringify(request);
}
