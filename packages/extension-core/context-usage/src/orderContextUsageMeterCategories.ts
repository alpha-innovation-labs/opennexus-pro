import type { ContextUsageCategory } from "./types";

/**
 * Orders meter categories so reserved buffer cells render at the end.
 *
 * @param categories Context usage categories.
 * @returns Categories with autocompact buffer markers rendered last.
 */
export function orderContextUsageMeterCategories(
	categories: readonly ContextUsageCategory[],
): ContextUsageCategory[] {
	return [...categories].sort(
		(left, right) =>
			Number(left.label === "Autocompact buffer") -
			Number(right.label === "Autocompact buffer"),
	);
}
