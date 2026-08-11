import type { CmuxSessionRegistryEntry } from "../session-registry/types";
import { formatCmuxWorkspaceShells } from "./formatCmuxWorkspaceShells";
import type { CmuxWorkspaceShellView } from "./types";

/**
 * Builds modal body lines for cmux workspace shell mappings.
 *
 * @param view Collected cmux workspace shell view.
 * @param registrations Live Nexus session registrations.
 * @returns Lines for the cmux workspace shell modal.
 */
export function createCmuxWorkspaceShellLines(
	view: CmuxWorkspaceShellView,
	registrations: CmuxSessionRegistryEntry[],
): string[] {
	return formatCmuxWorkspaceShells(view, registrations).split("\n").slice(1);
}
