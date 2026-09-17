import { readFileSync, writeFileSync } from "node:fs";
import type { ExitSidecar, SidecarReason } from "./types";

/**
 * Exit-sidecar file.
 *
 * The child's termination path writes a sidecar file next to the run's session file
 * carrying the exit code, a reason, and token counts. The sidecar is how the parent
 * reads intent that the exit code alone does not carry: pi exits zero even when the
 * model call failed after retries, so the sidecar `reason` is the discriminator and
 * overrides the exit code during classification.
 *
 * The sidecar lives next to the session file, so its path is derived from the session
 * file path alone. It is written by the child's `done`/`error`/`cancel` termination
 * path (a later bead) and read by the completion watcher.
 *
 * Target: context/extension/subagents/completion.md (the exit sidecar signal).
 */

/** The file-name suffix appended to the session file to name the sidecar. */
export const SIDECAR_FILE_SUFFIX = ".exit";

/** The sidecar schema version. */
export const SIDECAR_VERSION = 1 as const;

/** The set of sidecar reasons, for validating a parsed sidecar. */
const SIDECAR_REASONS: readonly SidecarReason[] = [
	"done",
	"error",
	"cancelled",
];

/**
 * The path of the exit sidecar for a run, derived from its session file path.
 *
 * The sidecar is placed next to the session file so it is found from the session path
 * alone, with no separate state store.
 */
export function sidecarPathFor(sessionPath: string): string {
	return `${sessionPath}${SIDECAR_FILE_SUFFIX}`;
}

/**
 * Whether a value is a non-negative, finite integer usable as a token count.
 */
function isTokenCount(value: unknown): value is number {
	return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

/**
 * Whether a value is a plain object (not an array, not null).
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Read and validate the exit sidecar for a run.
 *
 * Returns the parsed sidecar when the file is present and well-formed, or `null` when
 * the sidecar is absent, unreadable, malformed, or carries an unknown schema version.
 * An absent sidecar is not an error: a run that ends without one (for example one the
 * reaper ended before the child could write it) is classified from the exit code and
 * the tail alone.
 */
export function readExitSidecar(sessionPath: string): ExitSidecar | null {
	let raw: string;
	try {
		raw = readFileSync(sidecarPathFor(sessionPath), "utf8");
	} catch {
		return null;
	}

	let parsed: unknown;
	try {
		parsed = JSON.parse(raw);
	} catch {
		return null;
	}
	if (!isPlainObject(parsed)) return null;

	if (parsed.version !== SIDECAR_VERSION) return null;

	const reason = parsed.reason;
	if (
		typeof reason !== "string" ||
		!SIDECAR_REASONS.includes(reason as SidecarReason)
	) {
		return null;
	}

	const exitCode = parsed.exitCode;
	if (exitCode !== undefined && !isTokenCount(exitCode) && exitCode !== null) {
		return null;
	}

	const signal = parsed.signal;
	if (signal !== undefined && signal !== null && typeof signal !== "string") {
		return null;
	}

	const message = parsed.message;
	if (message !== undefined && typeof message !== "string") {
		return null;
	}

	// Build the sidecar immutably: include each optional field only when it is present
	// and valid (the guards above have already rejected anything else).
	return {
		version: SIDECAR_VERSION,
		reason: reason as SidecarReason,
		...(exitCode !== undefined ? { exitCode } : {}),
		...(signal !== undefined ? { signal } : {}),
		...(typeof message === "string" ? { message } : {}),
		...buildUsage(parsed.usage),
	};
}

/**
 * Extract the token-count usage block from a raw sidecar `usage` object, or nothing
 * when it is absent or carries no valid counts.
 */
function buildUsage(value: unknown): Partial<ExitSidecar> {
	if (!isPlainObject(value)) return {};
	const inputTokens = isTokenCount(value.inputTokens)
		? value.inputTokens
		: undefined;
	const outputTokens = isTokenCount(value.outputTokens)
		? value.outputTokens
		: undefined;
	const totalTokens = isTokenCount(value.totalTokens)
		? value.totalTokens
		: undefined;
	if (
		inputTokens === undefined &&
		outputTokens === undefined &&
		totalTokens === undefined
	) {
		return {};
	}
	return {
		usage: {
			...(inputTokens !== undefined ? { inputTokens } : {}),
			...(outputTokens !== undefined ? { outputTokens } : {}),
			...(totalTokens !== undefined ? { totalTokens } : {}),
		},
	};
}

/**
 * Write the exit sidecar for a run, next to its session file.
 *
 * This is the sidecar writer the child's termination path uses. It writes an
 * atomically-replaceable single JSON document; the completion watcher reads it back
 * with {@link readExitSidecar}.
 */
export function writeExitSidecar(
	sessionPath: string,
	sidecar: ExitSidecar,
): string {
	const path = sidecarPathFor(sessionPath);
	writeFileSync(path, `${JSON.stringify(sidecar)}\n`);
	return path;
}
