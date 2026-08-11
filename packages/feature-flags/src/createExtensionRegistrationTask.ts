import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { createProfiledExtensionApi } from "@nexus/observability/startup-profile/createProfiledExtensionApi";
import { logStartupProfileEvent } from "@nexus/observability/startup-profile/logStartupProfileEvent";
import { isPromiseLike } from "./isPromiseLike";
import type { ExtensionFeatureFlag } from "./types";

/**
 * Starts one extension registration and returns an async completion task.
 *
 * @param pi Pi extension API.
 * @param flag Extension feature flag to register.
 * @returns Promise that resolves when registration completion logging is done.
 */
export async function createExtensionRegistrationTask(
	pi: ExtensionAPI,
	flag: ExtensionFeatureFlag,
): Promise<void> {
	const startedAt = performance.now();
	logStartupProfileEvent(flag.id, "register:start");
	const extensionApi = createProfiledExtensionApi(pi, flag.id);
	const result = flag.register(extensionApi);
	if (isPromiseLike(result)) await result;
	logStartupProfileEvent(flag.id, "register:done", {
		durationMs: Number((performance.now() - startedAt).toFixed(3)),
	});
}
