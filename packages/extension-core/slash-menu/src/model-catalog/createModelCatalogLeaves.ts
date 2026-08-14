import {
	getBuiltinModels,
	getBuiltinProviders,
} from "@earendil-works/pi-ai";
import type { SlashMenuLeaf } from "../types";
import { createModelCatalogLeaf } from "./createModelCatalogLeaf";

/**
 * Builds full model catalog leaves from Pi's generated model registry.
 *
 * @returns Sorted full-catalog slash-menu leaves.
 */
export function createModelCatalogLeaves(): SlashMenuLeaf[] {
	return getBuiltinProviders()
		.flatMap((provider) =>
			getBuiltinModels(provider).map((model) => createModelCatalogLeaf(model)),
		)
		.sort(
			(left, right) =>
				left.groupLabel?.localeCompare(right.groupLabel ?? "") ||
				left.label.localeCompare(right.label),
		);
}
