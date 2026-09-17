import { existsSync } from "node:fs";
import { resolve } from "node:path";
import type { PiInvocation } from "./types";

/**
 * Environment variable that overrides the resolved pi command.
 *
 * A single token is a command with no base args (point at a bundled pi binary,
 * e.g. `PI_SUBAGENT_COMMAND=/usr/local/bin/pi`). Multiple whitespace-separated
 * tokens are a command plus base args. Tokens must not contain whitespace. This
 * is a dev/test escape hatch; the primary path relaunches the current process.
 */
export const PI_COMMAND_ENV_VAR = "PI_SUBAGENT_COMMAND" as const;

/**
 * Resolve the pi invocation that spawns a child.
 *
 * The parent extension runs inside a pi process, so the most robust invocation is
 * the one the parent is itself running: the current runtime (`process.execPath`)
 * plus the current entry script (`process.argv[1]`). A bundled binary has no
 * separate entry script, so it relaunches as just the binary.
 *
 * Precedence: an explicit override, then `PI_SUBAGENT_COMMAND`, then the current
 * process.
 *
 * @param overrides An explicit command and base args. `command` is used verbatim;
 *   `baseArgs` defaults to `[]` when omitted.
 * @returns The resolved pi invocation.
 */
export function resolvePiInvocation(overrides?: {
	readonly command?: string;
	readonly baseArgs?: readonly string[];
}): PiInvocation {
	if (overrides?.command !== undefined) {
		return {
			command: overrides.command,
			baseArgs: [...(overrides.baseArgs ?? [])],
		};
	}

	const fromEnv = readInvocationFromEnv();
	if (fromEnv !== undefined) return fromEnv;

	return invocationFromCurrentProcess();
}

/**
 * Read the `PI_SUBAGENT_COMMAND` override, if set. The first token is the command;
 * the remaining tokens are base args.
 */
function readInvocationFromEnv(): PiInvocation | undefined {
	const raw = process.env[PI_COMMAND_ENV_VAR];
	if (raw === undefined || raw.trim() === "") return undefined;
	const parts = raw.split(/\s+/).filter((token) => token.length > 0);
	if (parts.length === 0) return undefined;
	return { command: parts[0], baseArgs: parts.slice(1) };
}

/**
 * Build the invocation from the running process: the current runtime plus the
 * current entry script. When the entry script is not a real file (the bundled-binary
 * case, where `argv[1]` is the first real flag), relaunch the binary alone.
 */
function invocationFromCurrentProcess(): PiInvocation {
	const entry = process.argv[1];
	if (entry !== undefined) {
		const resolved = resolve(entry);
		if (existsSync(resolved)) {
			return { command: process.execPath, baseArgs: [resolved] };
		}
	}
	return { command: process.execPath, baseArgs: [] };
}
