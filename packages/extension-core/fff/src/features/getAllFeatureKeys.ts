import type { FffFeatureKey } from "../shared/types";
import { FFF_FEATURE_DEFINITIONS } from "./definitions";

/**
 * Returns every supported FFF feature key.
 *
 * @returns All local FFF feature keys.
 */
export function getAllFeatureKeys(): FffFeatureKey[] {
	return FFF_FEATURE_DEFINITIONS.map((feature) => feature.id);
}
