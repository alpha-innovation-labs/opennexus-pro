import { readFileSync } from "node:fs";
import {
	type FileEntry,
	parseSessionEntries,
} from "@earendil-works/pi-coding-agent";

/**
 * The session-file oracle for the headless e2e.
 *
 * The parent and child each leave a durable JSONL session file. These functions
 * read those files and extract the structural facts the e2e asserts on: the
 * parent's launch tool call, the steer-delivered result message, the child's
 * write tool call, the child's launch-metadata entry, and the parent's final
 * assistant text. Everything is structural — no prose matching.
 *
 * Target: context/extension/subagents/autonomous-testing.md (the oracle).
 */

/**
 * Parse a session JSONL file into typed entries.
 *
 * Throws when the file is missing or unparseable; the harness treats that as a
 * failed run (a missing session file is itself a signal).
 */
export function readSessionEntries(filePath: string): FileEntry[] {
	return parseSessionEntries(readFileSync(filePath, "utf8"));
}

/** A single tool call as it appears in an assistant message's content. */
export interface ToolCallRef {
	/** The tool that was called (e.g. `subagents_launch`, `write`). */
	readonly toolName: string;
	/** The raw arguments object the model supplied. */
	readonly args: Record<string, unknown>;
}

/**
 * Extract every tool call made by assistant messages, in transcript order.
 *
 * Tool calls live inside assistant message content blocks of type `toolCall`.
 */
export function extractToolCalls(entries: FileEntry[]): ToolCallRef[] {
	const calls: ToolCallRef[] = [];
	for (const entry of entries) {
		if (entry.type !== "message") continue;
		if (entry.message.role !== "assistant") continue;
		for (const block of entry.message.content) {
			if (block.type !== "toolCall") continue;
			calls.push({
				toolName: block.name,
				args: (block.arguments ?? {}) as Record<string, unknown>,
			});
		}
	}
	return calls;
}

/** Filter the tool calls down to a single tool name. */
export function findToolCalls(
	entries: FileEntry[],
	toolName: string,
): ToolCallRef[] {
	return extractToolCalls(entries).filter((call) => call.toolName === toolName);
}

/** A custom message persisted in a session (e.g. a steer-delivered result). */
export interface CustomMessageRef {
	readonly customType: string;
	readonly content: string | Array<{ readonly type: string; readonly text?: string }>;
	readonly details: unknown;
}

/**
 * Extract every custom message entry (type `custom_message`), in transcript order.
 *
 * The subagents result delivery persists a `subagent.result` custom message in the
 * parent's own transcript; this is the "delivery message" the e2e asserts on.
 */
export function extractCustomMessages(entries: FileEntry[]): CustomMessageRef[] {
	const out: CustomMessageRef[] = [];
	for (const entry of entries) {
		if (entry.type !== "custom_message") continue;
		out.push({
			customType: entry.customType,
			content: entry.content,
			details: entry.details,
		});
	}
	return out;
}

/** Filter the custom messages down to a single custom type. */
export function findCustomMessages(
	entries: FileEntry[],
	customType: string,
): CustomMessageRef[] {
	return extractCustomMessages(entries).filter(
		(message) => message.customType === customType,
	);
}

/**
 * The last assistant text block in the transcript, or `null` when there is none.
 *
 * The parent is steered to end its final turn by replying with a fixed marker
 * token; this is the value the e2e checks in the parent's transcript.
 */
export function finalAssistantText(entries: FileEntry[]): string | null {
	let last: string | null = null;
	for (const entry of entries) {
		if (entry.type !== "message") continue;
		if (entry.message.role !== "assistant") continue;
		for (const block of entry.message.content) {
			if (block.type === "text" && typeof block.text === "string") {
				last = block.text;
			}
		}
	}
	return last;
}

/** A plain custom entry (type `custom`) persisted in a session file. */
export interface CustomEntryRef {
	readonly customType: string;
	readonly data: unknown;
}

/**
 * Extract every plain custom entry (type `custom`), in transcript order.
 *
 * The child's seeded session file carries a `subagent.launch` custom entry that
 * persists the run's launch configuration.
 */
export function extractCustomEntries(entries: FileEntry[]): CustomEntryRef[] {
	const out: CustomEntryRef[] = [];
	for (const entry of entries) {
		if (entry.type !== "custom") continue;
		out.push({ customType: entry.customType, data: entry.data });
	}
	return out;
}
