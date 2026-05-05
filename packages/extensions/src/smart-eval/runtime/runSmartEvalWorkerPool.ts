export interface SmartEvalWorkerPoolOptions<T> {
	items: T[];
	concurrency: number;
	onItem: (item: T) => Promise<void>;
}

/**
 * Runs smart-eval work items through a bounded parallel worker pool.
 *
 * @param options Worker pool options.
 */
export async function runSmartEvalWorkerPool<T>(options: SmartEvalWorkerPoolOptions<T>): Promise<void> {
	let cursor = 0;
	const workerCount = Math.min(Math.max(1, options.concurrency), options.items.length);
	const workers = Array.from({ length: workerCount }, async () => {
		while (cursor < options.items.length) {
			const item = options.items[cursor];
			cursor += 1;
			if (item !== undefined) await options.onItem(item);
		}
	});
	await Promise.all(workers);
}
