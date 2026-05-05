const DEFAULT_SMART_EVAL_CONCURRENCY = 4;
const MAX_SMART_EVAL_CONCURRENCY = 8;

/**
 * Resolves bounded parallelism for background smart-eval generation.
 *
 * @param rawValue Optional environment override.
 * @returns Safe worker count.
 */
export function getSmartEvalConcurrency(rawValue = process.env.NEXUS_SMART_EVAL_CONCURRENCY): number {
	const parsed = Number.parseInt(rawValue ?? "", 10);
	if (!Number.isFinite(parsed) || parsed < 1) return DEFAULT_SMART_EVAL_CONCURRENCY;
	return Math.min(MAX_SMART_EVAL_CONCURRENCY, parsed);
}
