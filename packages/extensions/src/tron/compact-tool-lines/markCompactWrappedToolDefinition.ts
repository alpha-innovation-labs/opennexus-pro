import compactToolWrapMarker from "./compactToolWrapMarker.js";

/**
 * Marks a tool definition as already using Tron compact wrapping.
 *
 * @param definition Tool definition to mark.
 * @returns The same definition with the compact marker attached.
 */
export function markCompactWrappedToolDefinition<T extends object>(definition: T): T {
	Object.defineProperty(definition, compactToolWrapMarker, {
		value: true,
		configurable: false,
		enumerable: false,
		writable: false,
	});
	return definition;
}
