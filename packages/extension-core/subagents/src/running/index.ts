/**
 * Running-registry layer for the subagents extension.
 *
 * The parent's in-memory index of live runs, keyed by run id. Each entry holds
 * the process handle and its process group, the completion promise, the
 * session file path, the start time and entry count at launch, the stdout and
 * stderr tails, and the abort controller that stops the watcher loop. Lookup
 * is exact id first, then name, with an ambiguity error that names the ids;
 * completed runs move to a separate completed map so a result can be re-read
 * and delivered more than once without the run still appearing live. The
 * registry is a handle index, not the source of truth — the session file is
 * the record. See context/extension/subagents/running-registry.md.
 */

export {
	AmbiguousRunNameError,
	DuplicateRunIdError,
	RunNotFoundError,
} from "./errors";
export { RunningRegistry } from "./registry";
export { OutputTail } from "./tail";
export type {
	RegisterRunInput,
	RunCompletion,
	RunCompletionStatus,
	RunEntry,
	RunningRegistryOptions,
} from "./types";
