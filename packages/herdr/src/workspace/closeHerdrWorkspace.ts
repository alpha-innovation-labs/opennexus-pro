/**
 * Closes a Herdr workspace, cleaning up all its panes and agents.
 *
 * @param workspaceId The workspace ID to close (e.g. "w42").
 */

import { runHerdr } from "../core/runHerdr.js";

export function closeHerdrWorkspace(workspaceId: string): void {
	try {
		runHerdr(["workspace", "close", workspaceId]);
		console.error(`  ✓ Workspace ${workspaceId} closed.`);
	} catch {
		// Ignore — workspace may already be closed.
	}
}
