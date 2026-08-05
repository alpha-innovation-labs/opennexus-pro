/**
 * Reconstructs Pi's `createAllToolDefinitions` function.
 *
 * `createAllToolDefinitions` is declared in the `.d.ts` type definitions but
 * is **not re-exported** from `dist/index.js` at runtime. The only public
 * exports are the individual `create*BashToolDefinition` factories. This file
 * reconstructs the aggregate by calling those factories directly.
 *
 * Source: @earendil-works/pi-coding-agent@0.83.0
 */

import {
	createBashToolDefinition,
	createEditToolDefinition,
	createFindToolDefinition,
	createGrepToolDefinition,
	createLsToolDefinition,
	createReadToolDefinition,
	createWriteToolDefinition,
} from "@earendil-works/pi-coding-agent";

export interface PiToolDefinition {
	name: string;
	description: string;
	promptSnippet?: string;
}

/**
 * Creates Pi's built-in tool definitions.
 *
 * Reconstructs `createAllToolDefinitions` by calling each publicly exported
 * factory. If upstream ever re-exports `createAllToolDefinitions` from the
 * main entry point, replace this with a simple import.
 *
 * @param cwd Current working directory passed to Pi tool definition factories.
 * @returns Built-in Pi tool definitions keyed by tool name.
 */
export function createPiToolDefinitions(cwd: string): Record<string, PiToolDefinition> {
	return {
		read: createReadToolDefinition(cwd),
		bash: createBashToolDefinition(cwd),
		edit: createEditToolDefinition(cwd),
		write: createWriteToolDefinition(cwd),
		grep: createGrepToolDefinition(cwd),
		find: createFindToolDefinition(cwd),
		ls: createLsToolDefinition(cwd),
	} as Record<string, PiToolDefinition>;
}
