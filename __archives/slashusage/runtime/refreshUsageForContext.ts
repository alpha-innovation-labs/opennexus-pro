import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { detectProviderFromModel } from "../providers/detectProviderFromModel.js";
import { getUsageFetcher } from "../providers/getUsageFetcher.js";
import { getUsageSnapshot } from "../store/getUsageSnapshot.js";
import { setUsageLoading } from "../store/setUsageLoading.js";
import { setUsageSnapshot } from "../store/setUsageSnapshot.js";
import type { UsageSnapshot } from "../types.js";
import { shouldRefreshUsage } from "./shouldRefreshUsage.js";

/**
 * Refreshes usage for the active provider when needed.
 *
 * @param ctx Pi extension context.
 * @param force Whether refresh is forced.
 * @returns Latest usage snapshot.
 */
export async function refreshUsageForContext(ctx: ExtensionContext, force = false): Promise<UsageSnapshot | undefined> {
	const provider = detectProviderFromModel(ctx.model);
	if (!provider) return undefined;
	const current = getUsageSnapshot(provider);
	if (!shouldRefreshUsage(current, force)) return current;
	setUsageLoading(provider, true);
	try {
		const next = await getUsageFetcher(provider)();
		setUsageSnapshot(next);
		return next;
	} finally {
		setUsageLoading(provider, false);
	}
}
