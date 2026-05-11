/**
 * Creates social automation CLI usage text.
 *
 * @returns Help text for social automation commands.
 */
export function createSocialAutomationUsageText(): string {
	return [
		"Usage: nexus social-automation <twitter|youtube|status>",
		"Commands:",
		"  nexus social-automation twitter fetch --account <handle> [--account <handle> ...] [--json]",
		"  nexus social-automation youtube fetch --channel <url|@handle|channelId> [--channel <...> ...] [--json]",
		"  nexus social-automation status [--json]",
	].join("\n");
}
