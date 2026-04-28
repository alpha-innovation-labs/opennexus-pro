import type { CmuxSessionRegistryEntry } from "../session-registry/types.js";
import { formatCmuxWorkspaceShells } from "./formatCmuxWorkspaceShells.js";
import type { CmuxWorkspaceShellView } from "./types.js";

/**
 * Builds modal body lines for cmux workspace shell mappings.
 *
 * @param view Collected cmux workspace shell view.
 * @param registrations Live Nexus session registrations.
 * @returns Lines for the cmux workspace shell modal.
 */
export function createCmuxWorkspaceShellLines(view: CmuxWorkspaceShellView, registrations: CmuxSessionRegistryEntry[]): string[] {
	return formatCmuxWorkspaceShells(view, registrations).split("\n").slice(1);
}
