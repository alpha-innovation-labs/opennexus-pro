import type { CmuxSessionRegistryEntry } from "../session-registry/types.js";

const NEXUS_SHELL_ICON = "󰀘";
const TERMINAL_SHELL_ICON = "󰆍";

/**
 * Gets the icon for a cmux shell row.
 *
 * @param registration Matching Nexus session registration, when any.
 * @returns Nexus or terminal shell icon.
 */
export function getCmuxShellIcon(registration?: CmuxSessionRegistryEntry): string {
	return registration ? NEXUS_SHELL_ICON : TERMINAL_SHELL_ICON;
}
