import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { detectProviderFromModel } from "../providers/detectProviderFromModel.js";
import { getUsageFetcher } from "../providers/getUsageFetcher.js";
import { getUsageSnapshot } from "../store/getUsageSnapshot.js";
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
	const next = await getUsageFetcher(provider)();
	setUsageSnapshot(next);
	return next;
}
