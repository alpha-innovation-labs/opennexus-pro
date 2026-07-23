import type { AutomationRunRecord } from "../core/storage/types.js";
import { formatAutomationRunSummaryLines } from "./formatAutomationRunSummaryLines.js";

/**
 * Creates two summary lines per latest run.
 *
 * @param runs Latest automation runs ordered newest first.
 * @returns Four run summary lines for the latest two runs.
 */
export function createAutomationRunSummaryLines(runs: AutomationRunRecord[]): string[] {
	return [...formatAutomationRunSummaryLines(runs[0], 1), ...formatAutomationRunSummaryLines(runs[1], 2)];
}
