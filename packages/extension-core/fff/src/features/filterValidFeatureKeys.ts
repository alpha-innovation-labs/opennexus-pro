import type { FffFeatureKey } from "../shared/types";
import { getAllFeatureKeys } from "./getAllFeatureKeys";

/**
 * Filters unknown values out of a persisted feature-key list.
 *
 * @param values Raw persisted values.
 * @returns Valid feature keys only.
 */
export function filterValidFeatureKeys(values: unknown[]): FffFeatureKey[] {
	const valid = new Set(getAllFeatureKeys());
	return values.filter(
		(value): value is FffFeatureKey =>
			typeof value === "string" && valid.has(value as FffFeatureKey),
	);
}
