import { detectProviderFromModel } from "../providers/detectProviderFromModel.js";
import { getUsageSnapshot } from "../store/getUsageSnapshot.js";
import { isUsageLoading } from "../store/isUsageLoading.js";
import type { ProviderModel } from "../types.js";
import { formatUsageSlot } from "./formatUsageSlot.js";
import { selectUsagePair } from "./selectUsagePair.js";

/**
 * Builds the shared inline usage text for the active model.
 *
 * @param model Active model metadata.
 * @returns Inline usage text.
 */
export function getUsageTextForModel(model: ProviderModel): string {
	const provider = detectProviderFromModel(model);
	if (!provider) return `${formatUsageSlot(undefined)} | ${formatUsageSlot(undefined)}`;
	if (isUsageLoading(provider)) return "… loading";
	const pair = selectUsagePair(getUsageSnapshot(provider), model);
	return `${formatUsageSlot(pair?.daily)} | ${formatUsageSlot(pair?.weekly)}`;
}
