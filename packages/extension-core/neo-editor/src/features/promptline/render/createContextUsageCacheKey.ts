import type { ExtensionContext } from "@earendil-works/pi-coding-agent";

/**
 * Creates a cheap cache key for promptline context usage calculations.
 *
 * @param ctx Extension context.
 * @returns Cache key scoped to the active session leaf and model.
 */
export function createContextUsageCacheKey(ctx: ExtensionContext): string {
	const sessionManager = ctx.sessionManager as unknown as {
		getLeafId?: () => string | null | undefined;
		getEntries?: () => unknown[];
	};
	const model = ctx.model as unknown as
		| { id?: string; modelId?: string; contextWindow?: number }
		| string
		| undefined;
	const modelId =
		typeof model === "string"
			? model
			: (model?.id ?? model?.modelId ?? "no-model");
	const contextWindow =
		typeof model === "object" && model
			? (model.contextWindow ?? "unknown-window")
			: "unknown-window";
	const leafId =
		typeof sessionManager.getLeafId === "function"
			? (sessionManager.getLeafId() ?? "no-leaf")
			: undefined;
	const entryCount =
		leafId === undefined && typeof sessionManager.getEntries === "function"
			? sessionManager.getEntries().length
			: "leaf-tracked";

	return `${modelId}:${contextWindow}:${leafId ?? entryCount}`;
}
