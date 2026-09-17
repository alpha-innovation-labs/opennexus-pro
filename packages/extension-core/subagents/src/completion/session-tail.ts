import { readFileSync } from "node:fs";
import type {
	FileEntry,
	SessionMessageEntry,
} from "@earendil-works/pi-coding-agent";
import { parseSessionEntries } from "@earendil-works/pi-coding-agent";
import type { FinalAssistantMessage } from "./types";

/**
 * A single read of the run's session tail.
 *
 * Reads the file once and returns both the extracted final assistant message and the
 * total number of non-header entries, so the stable-summary reaper can detect "no new
 * entries" without a second read.
 */
export interface RunTail {
	/** The tail entries: the non-header entries after the launch snapshot. */
	readonly tail: FileEntry[];
	/** The final assistant message, or `null` when the run produced none yet. */
	readonly finalMessage: FinalAssistantMessage | null;
	/** The total number of non-header entries in the file (for change detection). */
	readonly nonHeaderCount: number;
}

/**
 * The session-tail signal.
 *
 * The new entries appended to the run's session file since the run launched, from
 * which the final assistant message is extracted as the summary. The tail is the
 * entries after the `entryCountAtLaunch` snapshot: the registry recorded the number of
 * non-header entries present at launch, so everything after that count is the run's own
 * output (an inherited fork/lineage branch is not).
 *
 * Target: context/extension/subagents/completion.md (the session-tail signal).
 */

/**
 * Read the run's session file as parsed entries.
 *
 * Returns `[]` when the file is absent or unreadable. The session file is the record
 * the child writes as it goes; the reader returns what parses.
 */
function readSessionEntries(sessionPath: string): FileEntry[] {
	try {
		return parseSessionEntries(readFileSync(sessionPath, "utf8"));
	} catch {
		return [];
	}
}

/**
 * The message payload of a session `message` entry, read loosely so the tail reader
 * does not have to name every `AgentMessage` variant. Only the assistant fields the
 * summary needs are read.
 */
interface AssistantMessageLike {
	role: string;
	content: readonly unknown[];
	stopReason?: string;
	errorMessage?: string;
}

/**
 * Whether a value is a text content block carrying a string `text`.
 */
function isTextBlock(value: unknown): value is { type: "text"; text: string } {
	if (typeof value !== "object" || value === null) return false;
	const block = value as Record<string, unknown>;
	return block.type === "text" && typeof block.text === "string";
}

/**
 * Extract the final assistant message from the run's session tail.
 *
 * The final assistant message is the last `message` entry in the tail whose role is
 * `assistant`. Its text content is joined (and trimmed) into a single summary string;
 * its stop reason and error message are carried so classification can tell a finished
 * answer from a terminal error.
 *
 * @param sessionPath Absolute path to the run's session file.
 * @param entryCountAtLaunch Number of non-header entries present at launch; the tail is
 *   every non-header entry after this count.
 * @returns The final assistant message, or `null` when the run produced no assistant
 *   message yet.
 */
/**
 * Read the run's session tail in one pass.
 *
 * The tail is the non-header entries appended after the `entryCountAtLaunch` snapshot
 * (the run's own output, not an inherited branch). The final assistant message is the
 * last `message` entry in the tail whose role is `assistant`.
 */
export function readRunTail(
	sessionPath: string,
	entryCountAtLaunch: number,
): RunTail {
	const fileEntries = readSessionEntries(sessionPath);

	// The header (type "session") is not part of the run's output; the tail is every
	// non-header entry appended after the launch snapshot.
	const nonHeader: FileEntry[] = [];
	for (const entry of fileEntries) {
		if (entry.type === "session") continue;
		nonHeader.push(entry);
	}
	const tail = nonHeader.slice(entryCountAtLaunch);

	return {
		tail,
		finalMessage: findFinalAssistantMessage(tail),
		nonHeaderCount: nonHeader.length,
	};
}

/**
 * Extract the final assistant message from the run's session tail.
 *
 * Convenience wrapper over {@link readRunTail} for callers that only need the summary.
 *
 * @param sessionPath Absolute path to the run's session file.
 * @param entryCountAtLaunch Number of non-header entries present at launch; the tail is
 *   every non-header entry after this count.
 * @returns The final assistant message, or `null` when the run produced no assistant
 *   message yet.
 */
export function extractFinalAssistantMessage(
	sessionPath: string,
	entryCountAtLaunch: number,
): FinalAssistantMessage | null {
	return readRunTail(sessionPath, entryCountAtLaunch).finalMessage;
}

/**
 * Find the last `assistant` `message` entry in a tail and summarize it.
 */
function findFinalAssistantMessage(
	tail: FileEntry[],
): FinalAssistantMessage | null {
	let final: SessionMessageEntry | undefined;
	for (const entry of tail) {
		if (entry.type !== "message") continue;
		// Some entry variants declare `type: string`, so narrow by cast rather than by
		// literal: the runtime `entry.type === "message"` guard above is authoritative.
		const messageEntry = entry as SessionMessageEntry;
		const message = messageEntry.message as unknown;
		if (typeof message === "object" && message !== null) {
			const assistant = message as AssistantMessageLike;
			if (assistant.role === "assistant") {
				final = messageEntry;
			}
		}
	}

	if (final === undefined) return null;

	const assistant = final.message as unknown as AssistantMessageLike;
	const textParts: string[] = [];
	for (const block of assistant.content) {
		if (isTextBlock(block)) {
			const text = block.text.trim();
			if (text.length > 0) textParts.push(text);
		}
	}
	const text = textParts.join("\n\n").trim();

	return {
		text,
		hasRealText: text.length > 0,
		...(assistant.stopReason !== undefined
			? { stopReason: assistant.stopReason }
			: {}),
		...(assistant.errorMessage !== undefined
			? { errorMessage: assistant.errorMessage }
			: {}),
		entryId: final.id,
		timestamp: final.timestamp,
	};
}
