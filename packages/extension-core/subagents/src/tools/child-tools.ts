import { randomUUID } from "node:crypto";
import { appendFileSync, readFileSync } from "node:fs";
import { type Static, Type } from "@earendil-works/pi-ai";
import {
	defineTool,
	type ExtensionAPI,
	type ExtensionContext,
} from "@earendil-works/pi-coding-agent";
import { sidecarPathFor, writeExitSidecar } from "../completion";

/**
 * Child-side tool definitions.
 *
 * These tools run inside the child (headless) pi process. The child is a separate
 * OS process reached only by its durable files and its exit, so both tools act by
 * writing durable state the parent's watcher reads:
 *
 * - `done` ends the run: it writes the exit sidecar (reason `"done"`) and the result
 *   `terminate` flag makes the child stop, so it exits and the parent's watcher
 *   classifies and delivers the run like any other finished run.
 * - `ping` delivers a note without ending the run: it writes a durable
 *   `subagent.ping` entry a reader of the session files can see, so the parent can
 *   learn something before the run completes.
 *
 * Target: context/extension/subagents/tool-surface.md (the child tools).
 */

/** The custom entry type the ping tool writes (a reader of the session files can see it). */
const PING_CUSTOM_TYPE = "subagent.ping";

const DoneParams = Type.Object({
	summary: Type.Optional(
		Type.String({
			description:
				"A short summary of the completed result, carried in the exit sidecar.",
		}),
	),
});

const PingParams = Type.Object({
	message: Type.String({
		description: "The note to deliver to the parent without ending the run.",
	}),
});

/**
 * Best-effort append of a `custom_message` entry to a session file, linking it under
 * the file's current leaf (the last well-formed entry's id). Returns whether the
 * entry was written. A reader of the session file can see the entry even if it landed
 * under a slightly-stale leaf while the writer is mid-turn.
 */
function appendCustomEntryToSession(
	sessionPath: string,
	customType: string,
	content: string,
	details: Record<string, unknown>,
): boolean {
	try {
		const raw = readFileSync(sessionPath, "utf8");
		let leafId: string | undefined;
		for (const line of raw.split("\n")) {
			if (line.length === 0) {
				continue;
			}
			let entry: { id?: unknown; type?: unknown };
			try {
				entry = JSON.parse(line) as { id?: unknown; type?: unknown };
			} catch {
				continue; // skip a partial (mid-write) line
			}
			if (entry && typeof entry.id === "string" && entry.type !== "session") {
				leafId = entry.id;
			}
		}
		const entry: Record<string, unknown> = {
			type: "custom_message",
			id: randomUUID(),
			parentId: leafId,
			timestamp: new Date().toISOString(),
			customType,
			content,
			details,
			display: true,
		};
		appendFileSync(sessionPath, `${JSON.stringify(entry)}\n`);
		return true;
	} catch {
		return false;
	}
}

/**
 * Register the child-side tools (`done` and `ping`) on the child's `ExtensionAPI`.
 */
export function registerChildTools(
	pi: Pick<ExtensionAPI, "registerTool" | "appendEntry">,
): void {
	pi.registerTool(
		defineTool({
			name: "done",
			label: "Subagent done",
			description:
				"End this subagent run. Writes the durable exit sidecar and stops the run, so the " +
				"parent's watcher classifies the result and delivers it. Provide a short summary of " +
				"the result; the final answer in the transcript is the durable result either way.",
			parameters: DoneParams,
			execute: async (
				_toolCallId: string,
				params: Static<typeof DoneParams>,
				_signal,
				_onUpdate,
				ctx: ExtensionContext,
			) => {
				const sessionFile = ctx.sessionManager.getSessionFile();
				if (sessionFile === undefined) {
					throw new Error(
						"The run's session file is unavailable; cannot record completion.",
					);
				}
				const now = new Date().toISOString();
				writeExitSidecar(sidecarPathFor(sessionFile), {
					version: 1,
					reason: "done",
					...(params.summary !== undefined ? { message: params.summary } : {}),
				});
				return {
					content: [
						{
							type: "text",
							text: "Run marked done. The exit sidecar is written and the run stops; the parent's watcher delivers the result.",
						},
					],
					details: {
						status: "done",
						sessionPath: sessionFile,
						at: now,
						...(params.summary !== undefined
							? { summary: params.summary }
							: {}),
					},
					// Stop the child after this tool batch: the run is finished, so the
					// headless process exits and the parent's watcher observes the exit.
					terminate: true,
				};
			},
		}),
	);

	pi.registerTool(
		defineTool({
			name: "ping",
			label: "Subagent ping",
			description:
				"Deliver a note to the parent without ending the run. Writes a durable subagent.ping " +
				"entry to the parent's session file (or this run's session when the parent path is " +
				"unavailable), so the parent can learn something before the run completes.",
			parameters: PingParams,
			execute: async (
				_toolCallId: string,
				params: Static<typeof PingParams>,
				_signal,
				_onUpdate,
				ctx: ExtensionContext,
			) => {
				const now = new Date().toISOString();
				const details = { version: 1, at: now, message: params.message };
				const sessionFile = ctx.sessionManager.getSessionFile();
				const runId = sessionFile ?? "unknown";

				// Prefer the parent's session file (the child's header records it for
				// lineage-only / fork modes), so the parent's transcript carries the note.
				const parentSession = ctx.sessionManager.getHeader()?.parentSession;
				if (parentSession !== undefined) {
					const delivered = appendCustomEntryToSession(
						parentSession,
						PING_CUSTOM_TYPE,
						params.message,
						details,
					);
					if (delivered) {
						return {
							content: [
								{
									type: "text",
									text: `Ping delivered to the parent: ${params.message}`,
								},
							],
							details,
						};
					}
				}

				// Fallback: record the note durably in this run's own session file. The
				// parent holds the run's session path and can read pings from it.
				pi.appendEntry(PING_CUSTOM_TYPE, details);
				return {
					content: [
						{
							type: "text",
							text: `Ping recorded in the run's session (the parent path was unavailable or unwritable): ${params.message}`,
						},
					],
					details: { ...details, runId },
				};
			},
		}),
	);
}
