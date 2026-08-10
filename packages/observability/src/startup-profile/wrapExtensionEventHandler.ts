import { logStartupProfileEvent } from "./logStartupProfileEvent";

/**
 * Wraps one extension event handler with startup-profile timing.
 *
 * @param extensionId Extension identifier.
 * @param eventName Event name.
 * @param handler Original extension handler.
 * @returns Wrapped handler.
 */
export function wrapExtensionEventHandler<TArgs extends unknown[], TResult>(
	extensionId: string,
	eventName: string,
	handler: (...args: TArgs) => TResult,
): (...args: TArgs) => Promise<TResult> {
	return async (...args: TArgs): Promise<TResult> => {
		const startedAt = performance.now();
		logStartupProfileEvent(extensionId, `${eventName}:start`);
		try {
			return await handler(...args);
		} finally {
			logStartupProfileEvent(extensionId, `${eventName}:done`, {
				durationMs: Number((performance.now() - startedAt).toFixed(3)),
			});
		}
	};
}
