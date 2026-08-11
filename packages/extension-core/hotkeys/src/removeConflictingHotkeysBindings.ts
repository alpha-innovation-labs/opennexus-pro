import { toKeyList } from "./toKeyList";

/**
 * Removes an overridden key from conflicting keybinding entries.
 *
 * @param config Mutable keybinding config copy.
 * @param conflictingIds Keybinding ids that must release the key.
 * @param key Key being assigned elsewhere.
 * @returns Config with conflicts unbound.
 */
export function removeConflictingHotkeysBindings(
	config: Record<string, string | string[] | undefined>,
	conflictingIds: string[],
	key: string,
): Record<string, string | string[] | undefined> {
	const nextConfig = { ...config };
	for (const id of conflictingIds) {
		const remaining = toKeyList(nextConfig[id]).filter(
			(existingKey) => existingKey !== key,
		);
		nextConfig[id] = remaining.length === 1 ? remaining[0] : remaining;
	}
	return nextConfig;
}
