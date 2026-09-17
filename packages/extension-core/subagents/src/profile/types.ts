/**
 * Agent-profile layer: a frontmatter file compiled into a child's argv and
 * environment before spawn.
 *
 * An agent profile is a variation on the child process, not a separate runtime.
 * The same pi binary runs every child; a profile is the frontmatter whose fields
 * are baked into a differently-configured process for each run. The parent never
 * mutates one shared process.
 *
 * Target: context/extension/subagents/agent-profiles.md.
 */

/**
 * How the profile's own `systemPrompt` lands on the child invocation.
 *
 * - `append`: the prompt is added to the base coding-assistant prompt via
 *   `--append-system-prompt`. The default, so a subagent keeps the base
 *   behavior and adds on top of it.
 * - `replace`: the prompt replaces the base via `--system-prompt`.
 */
export type SystemPromptMode = "append" | "replace";

/**
 * The environment variable that carries a profile's deny list to the child.
 *
 * `deny` is the one field that lands in the environment rather than the argv,
 * so the allow list and the deny list travel by different routes.
 */
export const PI_DENY_TOOLS_ENV_VAR = "PI_DENY_TOOLS" as const;

/**
 * An agent profile: the frontmatter fields compiled into the child invocation.
 *
 * Each field lands in exactly one place on the child. See the field-to-argv
 * mapping in context/extension/subagents/agent-profiles.md.
 */
export interface AgentProfile {
	/** Model identifier. Maps to the base of the `--model` value. */
	readonly model?: string;
	/** Thinking level. Maps to the `:<thinking>` suffix of the `--model` value. */
	readonly thinking?: string;
	/** Allowed tool names. Maps to the `--tools` allowlist argument. */
	readonly tools?: readonly string[];
	/** Denied tool names. Maps to the `PI_DENY_TOOLS` environment variable. */
	readonly deny?: readonly string[];
	/** Skill names or paths to load. Maps to `--skill` launch arguments. */
	readonly skills?: readonly string[];
	/** Additional skill launch arguments (injected skill files or directories). */
	readonly inject?: readonly string[];
	/** Disable AGENTS.md/CLAUDE.md discovery. Maps to `--no-context-files`. */
	readonly noContextFiles?: boolean;
	/** System prompt text. Maps to `--system-prompt` or `--append-system-prompt`. */
	readonly systemPrompt?: string;
	/** How `systemPrompt` lands. Defaults to `append`. */
	readonly systemPromptMode?: SystemPromptMode;
	/** Working directory the child runs in. Maps to the spawn working directory. */
	readonly cwd?: string;
	/** Environment variables merged into the child environment. */
	readonly env?: Readonly<Record<string, string>>;
	/** Raw flags appended to the argv, in order. */
	readonly flags?: readonly string[];
	/** Identity block: who the child is. Appended to the system prompt. */
	readonly identity?: string;
	/**
	 * Context-boundary prompt: the child is a subagent spawned from a parent and
	 * what it may and may not do. Appended to the system prompt.
	 */
	readonly contextBoundary?: string;
}

/**
 * The compiled child invocation a profile produces.
 *
 * This is the process variation the OS-process layer spawns: its own argv, its
 * own environment, its own working directory. The argv carries every profile
 * field except `cwd` (the spawn working directory) and the `env`-routed fields
 * (`deny` via `PI_DENY_TOOLS`); the identity and boundary prompts ride along as
 * `--append-system-prompt` so the child's scope is fixed at launch.
 */
export interface CompiledProfile {
	/** The child argv (profile-derived flags only; session/task args are added later). */
	readonly argv: string[];
	/** The environment variables merged into the child (profile `env` plus the `deny` list). */
	readonly env: Record<string, string>;
	/** The spawn working directory (`cwd`). */
	readonly cwd?: string;
}
