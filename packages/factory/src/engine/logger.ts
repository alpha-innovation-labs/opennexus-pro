/**
 * Default console logger for the engine.
 *
 * Provides human-readable step/block execution logging.
 * The Logger interface is pluggable — tests, CI, or a TUI can provide their own.
 *
 * @packageDocumentation
 */

import type { Logger, StepResult } from "./types.ts";

const ts = () => new Date().toLocaleTimeString([], { hour12: false });

export const defaultLogger: Logger = {
	stepStart: (stepId, stepType) => {
		console.error(`  [${ts()}] ▶ ${stepId} (${stepType})`);
	},
	stepEnd: (stepId, result) => {
		const status = result.success ? "✓" : "✗";
		const detail = result.success
			? "passed"
			: result.error ?? "unknown failure";
		console.error(`  [${ts()}] ${status} ${stepId}: ${detail}`);
	},
	blockStart: (blockType, blockId) => {
		console.error(`  [${ts()}] ┌ ${blockType}${blockId ? ` [${blockId}]` : ""}`);
	},
	blockEnd: (blockType, blockId) => {
		console.error(`  [${ts()}] └ ${blockType}${blockId ? ` [${blockId}]` : ""}`);
	},
	error: (message, context) => {
		console.error(`  [${ts()}] ✖ ${message} (${context})`);
	},
};
