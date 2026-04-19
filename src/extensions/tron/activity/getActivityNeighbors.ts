import { toolNeighbors, type ActivityNeighbors } from "./state.ts";

/**
 * Returns cached first/last ownership for one activity item.
 *
 * @param key Activity key.
 * @returns Neighbor ownership flags.
 */
export function getActivityNeighbors(key: string): ActivityNeighbors {
	return toolNeighbors.get(key) ?? { isFirst: true, isLast: true };
}
