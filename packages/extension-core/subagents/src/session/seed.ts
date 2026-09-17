import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import type {
	FileEntry,
	SessionEntry,
	SessionHeader,
} from "@earendil-works/pi-coding-agent";
import {
	buildContextEntries,
	CURRENT_SESSION_VERSION,
	parseSessionEntries,
} from "@earendil-works/pi-coding-agent";
import { createLaunchMetadataEntry } from "./launch-metadata";
import type {
	SeedSubagentSessionOptions,
	SubagentSessionHandle,
} from "./types";

/**
 * Pi session ids are non-empty, alphanumeric plus `-`, `_`, `.`. A UUID satisfies
 * this; a caller-supplied id is validated against the same rule before use.
 */
const SESSION_ID_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9._-]*[A-Za-z0-9])?$/;

/**
 * Generate an 8-hex-char entry id that does not collide with `taken`.
 * Falls back to a full UUID if 100 short attempts collide.
 */
function generateEntryId(taken: ReadonlySet<string>): string {
	for (let i = 0; i < 100; i++) {
		const id = randomUUID().slice(0, 8);
		if (!taken.has(id)) return id;
	}
	return randomUUID();
}

function resolveSessionId(explicit: string | undefined): string {
	const id = explicit ?? randomUUID();
	if (!SESSION_ID_PATTERN.test(id)) {
		throw new Error(
			"Invalid session id: must be non-empty, contain only alphanumeric " +
				"characters, '-', '_', or '.', and start and end with an alphanumeric",
		);
	}
	return id;
}

/**
 * Read a parent session file as parsed entries, without opening or mutating it.
 */
function readFileEntries(filePath: string): FileEntry[] {
	return parseSessionEntries(readFileSync(filePath, "utf8"));
}

/**
 * Read the parent's active, compaction-aware branch entries (root to leaf).
 *
 * Fork mode copies exactly this so the child inherits the parent's active
 * context and continues from the parent's current leaf.
 */
function readActiveBranch(parentSession: string): SessionEntry[] {
	const fileEntries = readFileEntries(parentSession);
	const header = fileEntries.find((entry) => entry.type === "session");
	if (!header) {
		throw new Error(`Parent session has no header: ${parentSession}`);
	}
	const sessionEntries = fileEntries.filter(
		(entry): entry is SessionEntry => entry.type !== "session",
	);
	if (sessionEntries.length === 0) return [];
	// No explicit leaf: the file is append-only, so the last entry is the leaf.
	return buildContextEntries(sessionEntries);
}

function sessionFileName(timestamp: string, id: string): string {
	const fileTimestamp = timestamp.replace(/[:.]/g, "-");
	return `${fileTimestamp}_${id}.jsonl`;
}

/**
 * Seed a subagent's JSONL session file before its child process starts.
 *
 * The file is the record and the returned handle is the in-memory reference.
 * Seeding happens before spawn so the parent's write of the launch metadata
 * cannot race the child's own header write, and a resume never reads a half-formed
 * file.
 *
 * The file is written in a single synchronous write, fully formed, in this order:
 * 1. the session header (recording the parent session for lineage when set);
 * 2. for `fork`, a verbatim copy of the parent's active branch entries;
 * 3. the launch-metadata custom entry, persisted next to the conversation the run
 *    already owns.
 *
 * The launch-metadata entry is written last so it becomes the leaf. A plain custom
 * entry does not participate in LLM context, so the child sees the inherited
 * branch as its context and continues appending beneath the entry.
 */
export function seedSubagentSession(
	options: SeedSubagentSessionOptions,
): SubagentSessionHandle {
	const { config, sessionDir } = options;
	const mode = config.mode;
	const cwd = config.cwd;

	const parentSession =
		mode === "standalone" ? undefined : options.parentSession;
	if (mode !== "standalone" && parentSession === undefined) {
		throw new Error(`Session mode "${mode}" requires a parentSession path.`);
	}

	const sessionId = resolveSessionId(options.id);
	const timestamp = new Date().toISOString();

	const header: SessionHeader = {
		type: "session",
		version: CURRENT_SESSION_VERSION,
		id: sessionId,
		timestamp,
		cwd,
	};
	if (parentSession !== undefined) {
		header.parentSession = parentSession;
	}

	// Fork: copy the parent's active branch, verbatim, preserving each entry's
	// id and parentId so the child's tree and context match the parent's.
	const branch =
		mode === "fork" && parentSession !== undefined
			? readActiveBranch(parentSession)
			: [];

	// The seeded leaf is the last copied branch entry, or the root when there is
	// no branch (standalone, lineage-only, or a fork of an empty parent).
	const leafId = branch.length > 0 ? branch[branch.length - 1].id : null;

	const takenIds = new Set<string>();
	for (const entry of branch) takenIds.add(entry.id);
	takenIds.add(sessionId);

	const launchEntry = createLaunchMetadataEntry({
		id: generateEntryId(takenIds),
		parentId: leafId,
		timestamp,
		// Record the child's own session id so a parent's launch entries can be
		// matched to this run when it is resumed from the parent's session file.
		sessionId,
		config,
	});

	const fileEntries: FileEntry[] = [header, ...branch, launchEntry];

	const dir = resolve(sessionDir);
	mkdirSync(dir, { recursive: true });
	const filePath = join(dir, sessionFileName(timestamp, sessionId));
	writeFileSync(
		filePath,
		fileEntries.map((entry) => `${JSON.stringify(entry)}\n`).join(""),
		{ flag: "wx" },
	);

	// Every non-header entry written at seed time counts toward the launch
	// snapshot: the inherited branch plus the launch-metadata entry itself.
	const entryCountAtLaunch = branch.length + 1;

	return {
		path: filePath,
		id: sessionId,
		mode,
		entryCountAtLaunch,
		startedAt: timestamp,
		...(parentSession !== undefined ? { parentSession } : {}),
	};
}
