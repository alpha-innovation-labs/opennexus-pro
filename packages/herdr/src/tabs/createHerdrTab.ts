/**
 * Creates a new Herdr tab and returns its identifier.
 * Mirrors `herdr tab create` with optional workspace, cwd, label, env, and focus.
 *
 * @param options Optional tab creation options.
 * @returns Object containing tabId.
 */

import { runHerdr } from "../core/runHerdr.js";
import { drill } from "../core/drill.js";

interface CreateTabOptions {
	label?: string;
	workspaceId?: string;
	cwd?: string;
	env?: Record<string, string>;
	focus?: boolean;
}

export function createHerdrTab(
	options?: CreateTabOptions,
): { tabId: string } {
	const args = ["tab", "create"];

	if (options?.workspaceId) {
		args.push("--workspace", options.workspaceId);
	}
	if (options?.cwd) {
		args.push("--cwd", options.cwd);
	}
	if (options?.label) {
		args.push("--label", options.label);
	}
	if (options?.env) {
		for (const [k, v] of Object.entries(options.env)) {
			args.push("--env", `${k}=${v}`);
		}
	}
	if (options?.focus === false) {
		args.push("--no-focus");
	} else if (options?.focus) {
		args.push("--focus");
	}

	const result = runHerdr(args);
	const tabId = drill(result, "result", "tab", "tab_id");

	if (!tabId) {
		throw new Error(
			`Failed to create tab: ${JSON.stringify(result)}`,
		);
	}

	return { tabId };
}
