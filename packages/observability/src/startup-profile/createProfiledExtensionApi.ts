import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { isStartupProfileEnabled } from "./isStartupProfileEnabled";
import { wrapExtensionEventHandler } from "./wrapExtensionEventHandler";

/**
 * Creates an extension API wrapper that times extension event handlers.
 *
 * @param pi Original extension API.
 * @param extensionId Extension identifier.
 * @returns Original or wrapped extension API.
 */
export function createProfiledExtensionApi(
	pi: ExtensionAPI,
	extensionId: string,
): ExtensionAPI {
	if (!isStartupProfileEnabled()) return pi;
	return new Proxy(pi, {
		get(target, property, receiver) {
			if (property !== "on") return Reflect.get(target, property, receiver);
			return (eventName: string, handler: (...args: unknown[]) => unknown) =>
				target.on(
					eventName as never,
					wrapExtensionEventHandler(extensionId, eventName, handler) as never,
				);
		},
	}) as ExtensionAPI;
}
