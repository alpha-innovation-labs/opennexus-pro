import { detectProviderFromModel } from "../providers/detectProviderFromModel.js";
import { getUsageSnapshot } from "../store/getUsageSnapshot.js";
import type { ProviderModel } from "../types.js";
import { renderUsageSlot } from "./renderUsageSlot.js";
import { selectUsagePair } from "./selectUsagePair.js";

/**
 * Renders the shared usage text for the active model with colored icons.
 *
 * @param theme Pi UI theme.
 * @param model Active model metadata.
 * @returns Rendered usage text.
 */
export function renderUsageTextForModel(
	theme: { fg(color: string, value: string): string },
	model: ProviderModel,
): string {
	const provider = detectProviderFromModel(model);
	if (!provider) return `${renderUsageSlot(theme, undefined)}${theme.fg("dim", " | ")}${renderUsageSlot(theme, undefined)}`;
	const pair = selectUsagePair(getUsageSnapshot(provider), model);
	return `${renderUsageSlot(theme, pair?.daily)}${theme.fg("dim", " | ")}${renderUsageSlot(theme, pair?.weekly)}`;
}
