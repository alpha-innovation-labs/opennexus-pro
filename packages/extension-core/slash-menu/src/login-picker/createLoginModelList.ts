import {
	type BuiltinProvider,
	builtinProviders,
	getBuiltinModels,
} from "@earendil-works/pi-ai";
import type { SlashMenuLeaf } from "../types";
import { resolveProviderModels } from "./resolveProviderModels";

/**
 * Builds right-pane model entries for the currently selected provider.
 *
 * When `providerId` is null/empty, returns an empty array (right pane shows
 * "Select a provider"). When a provider is selected, resolves its models
 * and applies the query filter via `filterMenuItems`.
 *
 * @param providerId Selected provider id, or null.
 * @param query Current search query.
 * @returns Model leaves for the right pane.
 */
export function createLoginModelList(
	providerId: string | null,
	query: string,
): SlashMenuLeaf[] {
	if (!providerId) return [];
	const catalog = builtinProviders().map((provider) => ({
		provider,
		models: getBuiltinModels(provider.id as BuiltinProvider),
	}));
	return resolveProviderModels(providerId, catalog, query);
}
