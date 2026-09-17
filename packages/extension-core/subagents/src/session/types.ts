/**
 * Session-state layer: the JSONL session file as durable run state.
 *
 * The child's JSONL session file is the record of a run; the in-memory handle
 * is the parent's fast path. Seeding writes the file fully-formed before the
 * child opens it. Target: context/extension/subagents/session-state.md.
 */

/**
 * How a subagent's session file is seeded before its child process starts.
 *
 * - `standalone`: a fresh file with only the header. The child starts with no
 *   inherited context.
 * - `lineage-only`: a header plus a pointer to the parent session file. The
 *   child knows its parent but does not copy the parent's conversation.
 * - `fork`: a header plus a copy of the parent's active branch entries. The
 *   child inherits the parent's context and continues from there.
 */
export type SessionMode = "standalone" | "lineage-only" | "fork";

/**
 * The launch configuration persisted inside the run's own session file.
 *
 * These are exactly the fields that built the child argv, plus the working
 * directory and the session mode. Resume reads this back to reconstruct the
 * original invocation with no separate state store.
 */
export interface SubagentLaunchConfig {
	/** Model identifier (maps to `--model`). */
	model?: string;
	/** Thinking level. */
	thinking?: string;
	/** Allowed tool names. */
	tools?: string[];
	/** Denied tool names. */
	deniedTools?: string[];
	/** Skill names to load. */
	skills?: string[];
	/** Extension names to load. */
	extensions?: string[];
	/** Working directory the child runs in. */
	cwd: string;
	/** The mode the file was seeded with. */
	mode: SessionMode;
	/** Raw flags that built the child argv. */
	flags?: string[];
	/** Environment variables that built the child argv. */
	env?: Record<string, string>;
	/** The task artifact file the child argv referenced (a `@<path>` argument). */
	taskArtifactPath?: string;
}

/**
 * The durable payload persisted as the launch-metadata custom entry.
 * Versioned so resume can guard against format drift.
 */
export interface SubagentLaunchMetadata {
	/** Schema version of the payload. */
	readonly version: 1;
	/**
	 * The child's session id (from its session header). Lets a parent's
	 * launch entries be matched to the run they recorded, when a run is
	 * resumed from the parent's session file.
	 */
	readonly sessionId?: string;
	/** The launch configuration. */
	readonly config: SubagentLaunchConfig;
}

/**
 * The parent's in-memory handle on a seeded run.
 *
 * Durable state lives in the session file; this handle is what the running
 * registry keeps as a convenience index. It is not the source of truth.
 */
export interface SubagentSessionHandle {
	/** The JSONL session file the run owns (the record). */
	readonly path: string;
	/** The stable session id (from the header). */
	readonly id: string;
	/** The mode the file was seeded with. */
	readonly mode: SessionMode;
	/** The parent session file path. Present for `lineage-only` and `fork`. */
	readonly parentSession?: string;
	/**
	 * Number of non-header entries in the file immediately after seeding.
	 * A later read knows the run produced every entry after this count.
	 */
	readonly entryCountAtLaunch: number;
	/** ISO timestamp of when the file was seeded (the run's start time). */
	readonly startedAt: string;
}

/**
 * Options for seeding a subagent session file before spawn.
 */
export interface SeedSubagentSessionOptions {
	/** The launch configuration to persist. `config.mode` selects the mode. */
	readonly config: SubagentLaunchConfig;
	/** Directory to create the session file in. Created if missing. */
	readonly sessionDir: string;
	/**
	 * The parent session file path. Required for `lineage-only` and `fork`,
	 * ignored for `standalone`.
	 */
	readonly parentSession?: string;
	/** Explicit session id. A random id is generated when omitted. */
	readonly id?: string;
}
