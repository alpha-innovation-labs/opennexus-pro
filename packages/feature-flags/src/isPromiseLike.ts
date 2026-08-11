/**
 * Checks whether a value can be awaited as a promise.
 *
 * @param value Value returned by an extension registration function.
 * @returns True when the value exposes a promise-like then callback.
 */
export function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
	return (
		typeof value === "object" &&
		value !== null &&
		"then" in value &&
		typeof value.then === "function"
	);
}
