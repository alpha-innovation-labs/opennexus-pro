/**
 * Default console logger for the engine.
 *
 * Provides human-readable step/block execution logging.
 * The Logger interface is pluggable — tests, CI, or a TUI can provide their own.
 *
 * @packageDocumentation
 */

import type { Logger, StepResult } from "./types.js";

export const defaultLogger: Logger = {
	stepStart: (stepId, stepType) => {
		console.error(`  ▶ ${stepId} (${stepType})`);
	},
	stepEnd: (stepId, result) => {
		const status = result.success ? "✓" : "✗";
		const detail = result.success
			? "passed"
			: result.error ?? "unknown failure";
		console.error(`  ${status} ${stepId}: ${detail}`);
	},
	blockStart: (blockType, blockId) => {
		console.error(`  ┌ ${blockType}${blockId ? ` [${blockId}]` : ""}`);
	},
	blockEnd: (blockType, blockId) => {
		console.error(`  └ ${blockType}${blockId ? ` [${blockId}]` : ""}`);
	},
	error: (message, context) => {
		console.error(`  ✖ ${message} (${context})`);
	},
};
