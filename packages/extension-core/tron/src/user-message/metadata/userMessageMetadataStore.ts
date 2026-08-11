import type { UserMessageMetadata } from "./types";

const metadataByComponent = new WeakMap<object, UserMessageMetadata>();
let pendingMetadata: UserMessageMetadata[] = [];

/**
 * Replaces pending user-message metadata with a new ordered queue.
 *
 * @param metadata Metadata entries in user-message render order.
 */
export function resetPendingUserMessageMetadata(
	metadata: UserMessageMetadata[] = [],
): void {
	pendingMetadata = [...metadata];
}

/**
 * Queues metadata for the next user-message component rendered by Tron.
 *
 * @param metadata Metadata captured for one user message.
 */
export function enqueueUserMessageMetadata(
	metadata: UserMessageMetadata,
): void {
	pendingMetadata.push(metadata);
}

/**
 * Assigns metadata directly to a user-message component.
 *
 * @param component User-message component instance.
 * @param metadata Metadata to associate with the component.
 */
export function setUserMessageMetadata(
	component: object,
	metadata: UserMessageMetadata,
): void {
	metadataByComponent.set(component, metadata);
}

/**
 * Resolves metadata for a component, consuming the pending queue on first render.
 *
 * @param component User-message component instance.
 * @returns Metadata associated with the component, when available.
 */
export function resolveUserMessageMetadata(
	component: object,
): UserMessageMetadata | undefined {
	const existing = metadataByComponent.get(component);
	if (existing) return existing;
	const metadata = pendingMetadata.shift();
	if (!metadata) return undefined;
	setUserMessageMetadata(component, metadata);
	return metadata;
}
