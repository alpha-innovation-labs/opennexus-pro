import type { RegisteredSlashCommand } from "./types";

/**
 * Returns the built-in interactive Pi slash commands.
 *
 * Pi intentionally does not expose BUILTIN_SLASH_COMMANDS through its public
 * API — `getCommands()` returns only extensions, prompt-templates, and skills.
 * The constant exists in dist/core/slash-commands.js but is not exported from
 * the package's exports field, and its .d.ts is unreachable.
 *
 * This list mirrors the Pi source (dist/core/slash-commands.js). Update when
 * Pi adds or renames a built-in command.
 *
 * @returns Built-in slash commands mapped for the slash menu pipeline.
 */
export function readBuiltinSlashCommands(): RegisteredSlashCommand[] {
	return [
		{
			name: "settings",
			description: "Open settings menu",
			source: "builtin" as const,
		},
		{
			name: "model",
			description: "Select model (opens selector UI)",
			source: "builtin" as const,
			argumentHint: "<provider/model>",
		},
		{
			name: "scoped-models",
			description: "Enable/disable models for Ctrl+P cycling",
			source: "builtin" as const,
		},
		{
			name: "export",
			description:
				"Export session (HTML default, or specify path: .html/.jsonl)",
			source: "builtin" as const,
		},
		{
			name: "import",
			description: "Import and resume a session from a JSONL file",
			source: "builtin" as const,
		},
		{
			name: "share",
			description: "Share session as a secret GitHub gist",
			source: "builtin" as const,
		},
		{
			name: "copy",
			description: "Copy last agent message to clipboard",
			source: "builtin" as const,
		},
		{
			name: "name",
			description: "Set session display name",
			source: "builtin" as const,
		},
		{
			name: "session",
			description: "Show session info and stats",
			source: "builtin" as const,
		},
		{
			name: "changelog",
			description: "Show changelog entries",
			source: "builtin" as const,
		},
		{
			name: "hotkeys",
			description: "Show all keyboard shortcuts",
			source: "builtin" as const,
		},
		{
			name: "fork",
			description: "Create a new fork from a previous user message",
			source: "builtin" as const,
		},
		{
			name: "clone",
			description: "Duplicate the current session at the current position",
			source: "builtin" as const,
		},
		{
			name: "tree",
			description: "Navigate session tree (switch branches)",
			source: "builtin" as const,
		},
		{
			name: "trust",
			description: "Save project trust decision for future sessions",
			source: "builtin" as const,
		},
		{
			name: "login",
			description: "Configure provider authentication",
			source: "builtin" as const,
			argumentHint: "<provider>",
		},
		{
			name: "logout",
			description: "Remove provider authentication",
			source: "builtin" as const,
		},
		{
			name: "new",
			description: "Start a new session",
			source: "builtin" as const,
		},
		{
			name: "compact",
			description: "Manually compact the session context",
			source: "builtin" as const,
		},
		{
			name: "resume",
			description: "Resume a different session",
			source: "builtin" as const,
		},
		{
			name: "reload",
			description:
				"Reload keybindings, extensions, skills, prompts, themes, and context files",
			source: "builtin" as const,
		},
		{ name: "quit", description: "Quit pi", source: "builtin" as const },
	];
}
