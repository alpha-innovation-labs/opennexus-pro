const NEXUS_CMUX_ICON = "󰀘";

/**
 * Formats a Nexus title for cmux surfaces and workspace rows.
 *
 * @param title Nexus session or workspace title.
 * @returns Title prefixed with the Nexus cmux icon.
 */
export function formatCmuxNexusTitle(title: string): string {
	const normalized = title.replace(/\s+/g, " ").trim();
	return normalized.startsWith(NEXUS_CMUX_ICON) ? normalized : `${NEXUS_CMUX_ICON}  ${normalized}`;
}
