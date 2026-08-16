/**
 * Creates a new Herdr workspace and returns its identifiers.
 * Mirrors `herdr workspace create` with optional cwd, label, env, and focus.
 *
 * @param options Optional workspace creation options.
 * @returns Object containing workspaceId and rootPaneId.
 */

import { runHerdr } from "../core/runHerdr.js";
import { drill } from "../core/drill.js";

interface CreateWorkspaceOptions {
	cwd?: string;
	label?: string;
	env?: Record<string, string>;
	focus?: boolean;
}

export function createHerdrWorkspace(
	options?: CreateWorkspaceOptions,
): { workspaceId: string; rootPaneId: string } {
	const args = ["workspace", "create"];

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
	const workspaceId = drill(result, "result", "workspace", "workspace_id");
	const rootPaneId = drill(result, "result", "root_pane", "pane_id");

	if (!workspaceId || !rootPaneId) {
		throw new Error(
			`Failed to create workspace: ${JSON.stringify(result)}`,
		);
	}

	return { workspaceId, rootPaneId };
}
