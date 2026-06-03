export type NexusUsageFeatureOptions = {
	annotation?: boolean;
	automations?: boolean;
	socialAutomation?: boolean;
	socialChat?: boolean;
};

/**
 * Creates the Nexus-owned top-level CLI help text.
 *
 * @param features CLI feature visibility options.
 * @returns Help text for supported Nexus CLI surfaces.
 */
export function createNexusUsageText(features: NexusUsageFeatureOptions = {}): string {
	return [
		"Usage: nexus [options] [prompt]",
		"",
		"Options:",
		"  -h, --help                         Show Nexus help",
		"  -v, --version                      Print Nexus version",
		"  --sessions                         List resumable sessions for the current folder",
		"  --sessions-all                     List resumable sessions across all folders",
		"  --delete-session <session-id>       Delete a persisted session",
		"  --json                             Print session listings as JSON",
		"  --observations <session-id>         Print observations for a session",
		"  --chat-status-file-location         Print the chat-status file path",
		"  --usage                            Open the usage history modal on startup",
		"  --session-dir <path>               Read sessions from a custom directory",
		"  --resume [session-id]              Resume from picker, or open a specific session",
		"  -r [session-id]                    Alias for --resume",
		"  --resume=<session-id>              Open a specific session directly",
		"  --startup-profile                  Write startup timings to /tmp/nexus-startup-profile.log",
		"  --no-extensions, -ne               Disable extension registration",
		...createCommandUsageLines(features),
		"",
		"Passthrough options:",
		"  -p <prompt>                        Submit a prompt and exit",
		"  --model <model>                    Select model",
		"  --mode <mode>                      Select run mode",
		"  --theme <path>                     Load an extra theme",
		"  --prompt-template <path>           Load extra prompt templates",
		"",
		"Notes:",
		"  Unknown prompts and other interactive flags are passed to the Nexus TUI.",
	].join("\n");
}

/**
 * Creates the visible top-level command help lines.
 *
 * @param features CLI feature visibility options.
 * @returns Command-section lines, or no lines when no commands are visible.
 */
function createCommandUsageLines(features: NexusUsageFeatureOptions): string[] {
	const lines: string[] = [
		"  nexus install <source>             Install an extension package",
		"  nexus uninstall <source>           Uninstall an extension package",
		"  nexus steer <session-id> <message> Queue a steering message for a running session",
		"  nexus observations list all|<id>   List observation artifacts",
		"  nexus observations delete all|<id> Delete observation artifacts",
		"  nexus observations recreate all|<id> Recreate observations from session JSONL",
		"  nexus observations view <id>       Print rendered observations",
		"  nexus observations get-location    Print the observations storage path",
	];
	if (features.automations) {
		lines.push(
			"  nexus automations -h              Show automation commands",
			"  nexus automations start           Start the automation daemon",
			"  nexus automations stop            Stop the automation daemon",
			"  nexus automations status          Show automation daemon and run summary",
			"  nexus automations list            List scheduled prompt automations",
		);
	}
	if (features.socialAutomation) {
		lines.push(
			"  nexus social-automation -h         Show social automation commands",
			"  nexus social-automation status     Show social automation storage status",
		);
	}
	if (features.socialChat) {
		lines.push(
			"  nexus social-chat -h               Show social chat commands",
			"  nexus social-chat start            Start the background social chat daemon",
			"  nexus social-chat stop             Stop the background social chat daemon",
			"  nexus social-chat restart          Restart the background social chat daemon",
			"  nexus social-chat status           Show social chat daemon status",
		);
	}
	if (features.annotation) {
		lines.push(
			"  nexus annotation -h                Show annotation daemon commands",
			"  nexus annotation start             Start the annotation daemon",
			"  nexus annotation stop              Stop the annotation daemon",
			"  nexus annotation restart           Restart the annotation daemon",
			"  nexus annotation status            Show annotation daemon status",
			"  nexus annotation logs              Show annotation daemon logs",
		);
	}
	return lines.length > 0 ? ["", "Commands:", ...lines] : [];
}
