export type NexusUsageFeatureOptions = {
	annotation?: boolean;
	gateway?: boolean;
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
		"  --sessions                         List resumable sessions",
		"  --observations <session-id>         Print observations for a session",
		"  --usage                            Open the usage history modal on startup",
		"  --session-dir <path>               Read sessions from a custom directory",
		"  --session-dir=<path>               Read sessions from a custom directory",
		"  --resume [session-id]              Resume from picker, or open a specific session",
		"  -r [session-id]                    Alias for --resume",
		"  --resume=<session-id>              Open a specific session directly",
		"  --session <session-id>             Open a specific session directly",
		"  --startup-profile                  Write startup timings to /tmp/nexus-startup-profile.log",
		"  --no-extensions, -ne               Disable bundled extension registration",
		"",
		"Passthrough options:",
		"  -p <prompt>                        Submit a prompt and exit",
		"  --model <model>                    Select model",
		"  --mode <mode>                      Select run mode",
		"  --theme <path>                     Load an extra theme",
		"  --prompt-template <path>           Load extra prompt templates",
		...createCommandUsageLines(features),
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
	const lines: string[] = [];
	if (features.gateway) {
		lines.push(
			"  nexus gateway -h                   Show gateway commands",
			"  nexus gateway start                Start the background gateway",
			"  nexus gateway stop                 Stop the background gateway",
			"  nexus gateway restart              Restart the background gateway",
			"  nexus gateway status               Show gateway status",
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
