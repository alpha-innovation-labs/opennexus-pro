/**
 * Creates the automations CLI usage text.
 *
 * @returns Help text for automations commands.
 */
export function createAutomationsUsageText(): string {
	return [
		"Usage: nexus automations <start|stop|status|list|create|edit|delete|templates>",
		"",
		"Commands:",
		"  nexus automations start",
		"  nexus automations stop",
		"  nexus automations status",
		"  nexus automations list",
		"  nexus automations create <name> --schedule <cron|shorthand> --prompt <text> [--cwd <path>]",
		"  nexus automations edit <id|name> [--name <name>] [--schedule <cron|shorthand>] [--prompt <text>] [--cwd <path>]",
		"  nexus automations delete <id|name>",
		"  nexus automations templates list",
		"  nexus automations templates use <template-id> --name <name> --schedule <cron|shorthand> [--yes]",
	].join("\n");
}
