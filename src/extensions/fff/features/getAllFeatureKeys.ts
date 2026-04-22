import { FFF_FEATURE_DEFINITIONS } from "./definitions.js";
import type { FffFeatureKey } from "../shared/types.js";

/**
 * Returns every supported FFF feature key.
 *
 * @returns All local FFF feature keys.
 */
export function getAllFeatureKeys(): FffFeatureKey[] {
  return FFF_FEATURE_DEFINITIONS.map((feature) => feature.id);
}
