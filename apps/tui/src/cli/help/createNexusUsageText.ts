/**
 * Creates the Nexus-owned top-level CLI help text.
 *
 * @returns Help text for supported Nexus CLI surfaces.
 */
export function createNexusUsageText(): string {
	return [
		"Usage: nexus [options] [prompt]",
		"",
		"Options:",
		"  -h, --help                         Show Nexus help",
		"  -v, --version                      Print Nexus version",
		"  --sessions                         List resumable sessions",
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
		"",
		"Commands:",
		"  nexus gateway -h                   Show gateway commands",
		"  nexus gateway start                Start the background gateway",
		"  nexus gateway stop                 Stop the background gateway",
		"  nexus gateway restart              Restart the background gateway",
		"  nexus gateway status               Show gateway status",
		"",
		"Notes:",
		"  Unknown prompts and other interactive flags are passed to the Nexus TUI.",
	].join("\n");
}
