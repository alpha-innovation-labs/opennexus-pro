import type { CmuxSessionRegistryEntry } from "../session-registry/types";
import { formatCmuxNexusTitle } from "./formatCmuxNexusTitle";
import { getCmuxShellIcon } from "./getCmuxShellIcon";
import type { CmuxSurface } from "./types";

/**
 * Formats a cmux surface as a shell label, replacing Nexus shells with session ids.
 *
 * @param surface cmux surface.
 * @param registration Matching Nexus session registration, when any.
 * @returns Human-readable shell label.
 */
export function formatCmuxSurfaceLabel(
	surface: CmuxSurface,
	registration?: CmuxSessionRegistryEntry,
): string {
	const icon = getCmuxShellIcon(registration);
	if (registration)
		return formatCmuxNexusTitle(
			registration.sessionTitle ?? "Untitled Nexus session",
		);
	const prefix = surface.type === "terminal" ? "" : `${surface.type}: `;
	return `${icon} ${prefix}${surface.title}`;
}
