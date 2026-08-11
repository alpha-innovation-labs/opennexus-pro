/**
 * Builds a user-facing read resolution failure message.
 *
 * @param action Current action name.
 * @param query Original path query.
 * @param error Failure error.
 * @returns Formatted failure text.
 */
export function buildReadFailureMessage(
	action: string,
	query: string,
	error: unknown,
): string {
	const message = error instanceof Error ? error.message : String(error);
	return message.includes(query)
		? message
		: `Could not ${action} "${query}". ${message}`;
}
