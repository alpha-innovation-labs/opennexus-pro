import type { CmuxSessionRegistryEntry } from "../session-registry/types.js";
import { formatCmuxNexusTitle } from "./formatCmuxNexusTitle.js";
import { getCmuxShellIcon } from "./getCmuxShellIcon.js";
import type { CmuxSurface } from "./types.js";

/**
 * Formats a cmux surface as a shell label, replacing Nexus shells with session ids.
 *
 * @param surface cmux surface.
 * @param registration Matching Nexus session registration, when any.
 * @returns Human-readable shell label.
 */
export function formatCmuxSurfaceLabel(surface: CmuxSurface, registration?: CmuxSessionRegistryEntry): string {
	const icon = getCmuxShellIcon(registration);
	if (registration) return formatCmuxNexusTitle(registration.sessionTitle ?? "Untitled Nexus session");
	const prefix = surface.type === "terminal" ? "" : `${surface.type}: `;
	return `${icon} ${prefix}${surface.title}`;
}
