/**
 * Enqueues one observation update task per conversation.
 *
 * @param queues Per-conversation task chains.
 * @param conversationId Conversation identifier.
 * @param task Task to run.
 */
export function enqueueObservationTask(
	queues: Map<string, Promise<void>>,
	conversationId: string,
	task: () => Promise<void>,
): void {
	const previous = queues.get(conversationId) ?? Promise.resolve();
	const next = previous.catch(() => undefined).then(task);
	queues.set(conversationId, next.finally(() => {
		if (queues.get(conversationId) === next) queues.delete(conversationId);
	}));
}
