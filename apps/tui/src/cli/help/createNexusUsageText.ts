/**
 * Creates the Nexus-owned top-level CLI help text.
 *
 * @param features CLI feature visibility options.
 * @returns Help text for supported Nexus CLI surfaces.
 */
export function createNexusUsageText(_features: Record<string, never> = {}): string {
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
		"  --usage                            Open the usage history modal on startup",
		"  --session-dir <path>               Read sessions from a custom directory",
		"  --resume [session-id]              Resume from picker, or open a specific session",
		"  -r [session-id]                    Alias for --resume",
		"  --resume=<session-id>              Open a specific session directly",
		"  --startup-profile                  Write startup timings to /tmp/nexus-startup-profile.log",
		"  --no-extensions, -ne               Disable extension registration",
		"  --minimal, -m                      Start with a minimal extension set",
		"  --disable-features <list>          Disable listed features (comma-separated IDs)",
		"  --enable-features <list>           Force-enable listed features (comma-separated IDs)",
		...createCommandUsageLines(),
		"",
		"Options (passed through to Pi):",
		"  --provider <name>                  Provider name (default: google)",
		"  --model <pattern>                  Model pattern or ID (supports 'provider/id' and ':<thinking>')",
		"  --api-key <key>                    API key (defaults to env vars)",
		"  --system-prompt <text>             System prompt (default: coding assistant prompt)",
		"  --append-system-prompt <text>      Append text or file contents to the system prompt",
		"  --mode <mode>                      Output mode: text (default), json, or rpc",
		"  --print, -p                        Non-interactive mode: process prompt and exit",
		"  --continue, -c                     Continue previous session",
		"  --resume, -r                       Select a session to resume",
		"  --session <path|id>                Use specific session file or partial UUID",
		"  --session-id <id>                  Use exact project session ID, creating it if missing",
		"  --fork <path|id>                   Fork specific session file or partial UUID",
		"  --session-dir <dir>                Directory for session storage and lookup",
		"  --no-session                       Don't save session (ephemeral)",
		"  --name, -n <name>                  Set session display name",
		"  --models <patterns>                Comma-separated model patterns for Ctrl+P cycling",
		"  --no-tools, -nt                    Disable all tools by default",
		"  --no-builtin-tools, -nbt           Disable built-in tools but keep extension tools",
		"  --tools, -t <tools>                Comma-separated allowlist of tool names",
		"  --exclude-tools, -xt <tools>       Comma-separated denylist of tool names",
		"  --thinking <level>                 Thinking level: off, minimal, low, medium, high, xhigh, max",
		"  --extension, -e <path>             Load an extension file",
		"  --skill <path>                     Load a skill file or directory",
		"  --no-skills, -ns                   Disable skills discovery and loading",
		"  --prompt-template <path>           Load a prompt template file or directory",
		"  --no-prompt-templates, -np         Disable prompt template discovery and loading",
		"  --theme <path>                     Load a theme file or directory",
		"  --no-themes                        Disable theme discovery and loading",
		"  --no-context-files, -nc            Disable AGENTS.md and CLAUDE.md discovery",
		"  --export <file>                    Export session file to HTML and exit",
		"  --list-models [search]             List available models (with optional fuzzy search)",
		"  --verbose                          Force verbose startup (overrides quietStartup setting)",
		"  --approve, -a                      Trust project-local files for this run",
		"  --no-approve, -na                  Ignore project-local files for this run",
		"  --offline                          Disable startup network operations",
		"",
		"Notes:",
		"  Unknown prompts and other interactive flags are passed to the Nexus TUI.",
	].join("\n");
}

/**
 * Creates the visible top-level command help lines.
 *
 * @returns Command-section lines, or no lines when no commands are visible.
 */
function createCommandUsageLines(): string[] {
	return [
		"  nexus install <source>             Install an extension package",
		"  nexus uninstall <source>           Uninstall an extension package",
		"  nexus steer <session-id> <message> Queue a steering message for a running session",
		"  nexus observations list all|<id>   List observation artifacts",
		"  nexus observations delete all|<id> Delete observation artifacts",
		"  nexus observations recreate all|<id> Recreate observations from session JSONL",
		"  nexus observations view <id>       Print rendered observations",
		"  nexus observations get-location    Print the observations storage path",
		"  nexus themes                       Show themes help",
		"  nexus themes list [name]           List available themes",
		"  nexus themes set <theme>           Set the project theme",
		"  nexus tools                        List all available tools",
	];
}
