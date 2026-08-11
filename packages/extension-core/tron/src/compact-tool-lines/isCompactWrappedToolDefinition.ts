import compactToolWrapMarker from "./compactToolWrapMarker";

/**
 * Checks whether a tool definition already uses Tron compact wrapping.
 *
 * @param definition Tool definition candidate.
 * @returns True when the definition is already compact-wrapped.
 */
export function isCompactWrappedToolDefinition(definition: unknown): boolean {
	return Boolean(
		(definition as Record<PropertyKey, unknown> | undefined)?.[
			compactToolWrapMarker
		],
	);
}
