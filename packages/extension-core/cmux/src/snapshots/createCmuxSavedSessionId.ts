/**
 * Creates a unique id for a saved cmux session snapshot.
 *
 * @returns Unique snapshot id.
 */
export function createCmuxSavedSessionId(): string {
	return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
