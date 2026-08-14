import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { createProfiledExtensionApi } from "@nexus/observability";
import { logStartupProfileEvent } from "@nexus/observability";
import { isPromiseLike } from "./isPromiseLike";
import type { ExtensionFeatureFlag } from "./types";

interface ExtensionRegistrationCounts {
	enabledExtensionCount: number;
	enabledMiniAppCount: number;
}

/**
 * Starts one extension registration and returns an async completion task.
 *
 * @param pi Pi extension API.
 * @param flag Extension feature flag to register.
 * @param counts Pre-computed extension counts (optional, for extensions that
 *   need them without importing @nexus/feature-flags).
 * @returns Promise that resolves when registration completion logging is done.
 */
export async function createExtensionRegistrationTask(
	pi: ExtensionAPI,
	flag: ExtensionFeatureFlag,
	counts?: ExtensionRegistrationCounts,
): Promise<void> {
	const startedAt = performance.now();
	logStartupProfileEvent(flag.id, "register:start");
	const extensionApi = createProfiledExtensionApi(pi, flag.id);
	// Call register with optional counts for extensions that accept them.
	// The ExtensionFeatureFlag type only declares (pi) => void, but some
	// registration functions accept an optional second parameter for pre-
	// computed data (e.g., startup-hero counts). The extra param is optional
	// so this remains type-safe.
	const result = (flag.register as (
		pi: ExtensionAPI,
		counts?: ExtensionRegistrationCounts,
	) => void | Promise<void>)(extensionApi, counts);
	if (isPromiseLike(result)) await result;
	logStartupProfileEvent(flag.id, "register:done", {
		durationMs: Number((performance.now() - startedAt).toFixed(3)),
	});
}
