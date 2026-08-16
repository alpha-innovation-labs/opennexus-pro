/**
 * Core result drilling utility.
 *
 * Extracts a value from nested object keys, returning `undefined` if any
 * key in the path is missing or not a string. Used by every module to
 * safely navigate the JSON response shape from the `herdr` CLI.
 */
/**
 * Drills into nested object keys, returning undefined if any key is missing.
 *
 * @param data Root object to drill into.
 * @param keys Key path to follow.
 * @returns The final string value, or `undefined`.
 */
export declare function drill(data: Record<string, unknown>, ...keys: string[]): string | undefined;
